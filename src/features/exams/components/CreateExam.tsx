import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  HStack,
  VStack,
  Box,
  Badge,
  IconButton,
  Divider,
  useDisclosure,
  Heading,
  Text,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import examService from '@/features/exams/examService';
import courseService from '@/features/courses/courseService';
import { axiosInstance, getImageUrl } from '@/lib/axios';
import { ICreateExamRequest, IGenerateExamRequest, IQuestionBankResponse, IAnswer } from '@/types/exam.types';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import userService from '@/features/user/userService';

interface CreateExamProps {
  onSuccess: () => void;
  trigger: React.ReactElement;
  examId?: string; // For editing
}

type CreationMethod = 'new' | 'bank' | 'pdf' | 'true_false';

export default function CreateExam({ onSuccess, trigger, examId }: CreateExamProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { role, user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>('new');

  // Form state
  const [formData, setFormData] = useState<Partial<ICreateExamRequest>>({
    title: '',
    description: '',
    examType: 'general',
    contentType: 'questions',
    settings: {
      duration: 0,
      passingScore: 50,
      showResults: true,
      showCorrectAnswers: true,
      allowRetake: true,
      maxAttempts: 0,
      shuffleQuestions: false,
      shuffleAnswers: false,
      requireAll: true,
    },
  });

  // For new questions method
  const [newQuestions, setNewQuestions] = useState<Array<{
    question: string;
    questionType: 'mcq' | 'true_false' | 'written';
    answers: IAnswer[];
    correctAnswer?: string;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>>([]);

  // For bank questions method
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [bankQuestions, setBankQuestions] = useState<IQuestionBankResponse[]>([]);
  const [bankFilters, setBankFilters] = useState({
    page: 1,
    limit: 20,
    questionType: '' as 'mcq' | 'true_false' | 'written' | '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | '',
  });
  const [generateCriteria, setGenerateCriteria] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    pointsPerQuestion: 1,
  });

  // For PDF method
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // For true/false method
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<Array<{
    question: string;
    correctAnswer: boolean;
    points: number;
  }>>([]);

  // Data for dropdowns
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      if (role === UserRole.ADMIN) {
        fetchTeachers();
      }
      // Load existing exam data if editing
      if (examId) {
        loadExamData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, examId, role]);

  const loadExamData = async () => {
    if (!examId) return;
    try {
      const response = await examService.getExamById(examId);
      const exam = response.data.exam;
      setFormData({
        title: exam.title || '',
        description: exam.description || '',
        examType: exam.examType || 'general',
        contentType: exam.contentType || 'questions',
        course: exam.course?._id || '',
        lesson: exam.lesson?._id || '',
        teacher: exam.teacher?._id || '',
        settings: exam.settings || {
          duration: 0,
          passingScore: 50,
          showResults: true,
          showCorrectAnswers: true,
          allowRetake: true,
          maxAttempts: 0,
          shuffleQuestions: false,
          shuffleAnswers: false,
          requireAll: true,
        },
      });
      if (exam.course) {
        setSelectedCourseId(exam.course._id);
      }
      // Handle PDF URL if exists
      if (exam.contentType === 'pdf' && exam.pdfUrl) {
        setPdfPreview(exam.pdfUrl);
        setCreationMethod('pdf');
      }
    } catch (error: any) {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'فشل تحميل بيانات الامتحان',
      });
    }
  };

  useEffect(() => {
    if (selectedCourseId && isOpen) {
      fetchLessons(selectedCourseId);
    } else {
      setLessons([]);
    }
  }, [selectedCourseId, isOpen]);

  useEffect(() => {
    if (isOpen && creationMethod === 'bank') {
      fetchBankQuestions();
    }
  }, [isOpen, creationMethod, bankFilters]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getMyCourses({ limit: 100 });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const response = await courseService.getCourseLessons(courseId);
      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error('Failed to fetch lessons', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await userService.getAllTeachers({ limit: 100 });
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const fetchBankQuestions = async () => {
    try {
      const response = await examService.getQuestions({
        page: bankFilters.page,
        limit: bankFilters.limit,
        questionType: bankFilters.questionType || undefined,
        difficulty: bankFilters.difficulty || undefined,
        activeOnly: true,
      });
      setBankQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Failed to fetch bank questions', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: 'خطأ',
        description: 'العنوان مطلوب',
        status: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      if (creationMethod === 'new') {
        // Create questions in bank first, then create exam
        const questionIds: string[] = [];
        for (const q of newQuestions) {
          const questionData = {
            question: q.question,
            questionType: q.questionType,
            answers: q.answers,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty,
            points: q.points,
            isGeneral: formData.examType === 'general',
            course: formData.course,
            lesson: formData.lesson,
          };
          const created = await examService.createQuestion(questionData);
          questionIds.push(created.data.question._id);
        }

        const examData: ICreateExamRequest = {
          ...formData,
          contentType: 'questions',
          questions: questionIds.map((id, idx) => ({
            question: id,
            points: newQuestions[idx].points,
            order: idx + 1,
          })),
          teacher: role === UserRole.ADMIN ? formData.teacher : undefined,
        } as ICreateExamRequest;

        await examService.createExam(examData);
      } else if (creationMethod === 'bank') {
        if (selectedQuestions.length === 0) {
          toast({
            title: 'خطأ',
            description: 'يجب اختيار سؤال واحد على الأقل',
            status: 'error',
          });
          setLoading(false);
          return;
        }

        const examData: ICreateExamRequest = {
          ...formData,
          contentType: 'questions',
          questions: selectedQuestions.map((id, idx) => ({
            question: id,
            points: generateCriteria.pointsPerQuestion,
            order: idx + 1,
          })),
          teacher: role === UserRole.ADMIN ? formData.teacher : undefined,
        } as ICreateExamRequest;

        await examService.createExam(examData);
      } else if (creationMethod === 'pdf') {
        if (!pdfFile && !examId) {
          toast({
            title: 'خطأ',
            description: 'ملف PDF مطلوب',
            status: 'error',
          });
          setLoading(false);
          return;
        }

        const formDataObj = new FormData();
        formDataObj.append('title', formData.title || '');
        if (formData.description) formDataObj.append('description', formData.description);
        formDataObj.append('examType', formData.examType || 'general');
        formDataObj.append('contentType', 'pdf');
        if (formData.lesson) formDataObj.append('lesson', formData.lesson);
        if (formData.course) formDataObj.append('course', formData.course);
        if (pdfFile) {
          formDataObj.append('pdfFile', pdfFile);
        }
        if (formData.settings) {
          formDataObj.append('settings', JSON.stringify(formData.settings));
        }
        if (role === UserRole.ADMIN && formData.teacher) {
          formDataObj.append('teacher', formData.teacher);
        }

        if (examId) {
          await axiosInstance.put(`/exams/${examId}`, formDataObj, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          await axiosInstance.post('/exams', formDataObj, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else if (creationMethod === 'true_false') {
        if (trueFalseQuestions.length === 0) {
          toast({
            title: 'خطأ',
            description: 'يجب إضافة سؤال واحد على الأقل',
            status: 'error',
          });
          setLoading(false);
          return;
        }

        // Create true/false questions in bank
        const questionIds: string[] = [];
        for (const q of trueFalseQuestions) {
          const questionData = {
            question: q.question,
            questionType: 'true_false' as const,
            answers: [
              { text: 'صحيح', isCorrect: q.correctAnswer, order: 1 },
              { text: 'خطأ', isCorrect: !q.correctAnswer, order: 2 },
            ],
            correctAnswer: q.correctAnswer ? 'صحيح' : 'خطأ',
            difficulty: 'medium' as const,
            points: q.points,
            isGeneral: formData.examType === 'general',
            course: formData.course,
            lesson: formData.lesson,
          };
          const created = await examService.createQuestion(questionData);
          questionIds.push(created.data.question._id);
        }

        const examData: ICreateExamRequest = {
          ...formData,
          contentType: 'questions',
          questions: questionIds.map((id, idx) => ({
            question: id,
            points: trueFalseQuestions[idx].points,
            order: idx + 1,
          })),
          teacher: role === UserRole.ADMIN ? formData.teacher : undefined,
        } as ICreateExamRequest;

        await examService.createExam(examData);
      }

      toast({
        title: 'نجح',
        description: 'تم إنشاء الامتحان بنجاح',
        status: 'success',
      });
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في إنشاء الامتحان',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      examType: 'general',
      contentType: 'questions',
      settings: {
        duration: 0,
        passingScore: 50,
        showResults: true,
        showCorrectAnswers: true,
        allowRetake: true,
        maxAttempts: 0,
        shuffleQuestions: false,
        shuffleAnswers: false,
        requireAll: true,
      },
    });
    setNewQuestions([]);
    setSelectedQuestions([]);
    setPdfFile(null);
    setPdfPreview(null);
    setTrueFalseQuestions([]);
    setSelectedCourseId('');
    setCreationMethod('new');
    setActiveTab(0);
  };

  const addNewQuestion = () => {
    setNewQuestions([...newQuestions, {
      question: '',
      questionType: 'mcq',
      answers: [
        { text: '', isCorrect: false, order: 1 },
        { text: '', isCorrect: false, order: 2 },
      ],
      points: 1,
      difficulty: 'medium',
    }]);
  };

  const updateNewQuestion = (index: number, field: string, value: any) => {
    const updated = [...newQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setNewQuestions(updated);
  };

  const addAnswerToQuestion = (questionIndex: number) => {
    const updated = [...newQuestions];
    updated[questionIndex].answers.push({
      text: '',
      isCorrect: false,
      order: updated[questionIndex].answers.length + 1,
    });
    setNewQuestions(updated);
  };

  const removeAnswerFromQuestion = (questionIndex: number, answerIndex: number) => {
    const updated = [...newQuestions];
    updated[questionIndex].answers.splice(answerIndex, 1);
    updated[questionIndex].answers.forEach((a, idx) => {
      a.order = idx + 1;
    });
    setNewQuestions(updated);
  };

  const addTrueFalseQuestion = () => {
    setTrueFalseQuestions([...trueFalseQuestions, {
      question: '',
      correctAnswer: true,
      points: 1,
    }]);
  };

  const updateTrueFalseQuestion = (index: number, field: string, value: any) => {
    const updated = [...trueFalseQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setTrueFalseQuestions(updated);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  return (
    <>
      <Box onClick={onOpen}>{trigger}</Box>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent dir="rtl">
          <ModalHeader>إنشاء امتحان جديد</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              {/* Basic Info */}
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>عنوان الامتحان</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="أدخل عنوان الامتحان"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>الوصف</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف الامتحان (اختياري)"
                    rows={3}
                  />
                </FormControl>

                <HStack>
                  <FormControl isRequired>
                    <FormLabel>نوع الامتحان</FormLabel>
                    <Select
                      value={formData.examType}
                      onChange={(e) => {
                        const examType = e.target.value as any;
                        setFormData({ ...formData, examType, course: undefined, lesson: undefined });
                        setSelectedCourseId('');
                      }}
                    >
                      <option value="general">عام</option>
                      <option value="course">كورس</option>
                      <option value="lesson">درس</option>
                    </Select>
                  </FormControl>

                  {formData.examType === 'course' && (
                    <FormControl isRequired>
                      <FormLabel>الكورس</FormLabel>
                      <Select
                        value={selectedCourseId}
                        onChange={(e) => {
                          setSelectedCourseId(e.target.value);
                          setFormData({ ...formData, course: e.target.value, lesson: undefined });
                        }}
                        placeholder="اختر الكورس"
                      >
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {formData.examType === 'lesson' && (
                    <>
                      <FormControl isRequired>
                        <FormLabel>الكورس</FormLabel>
                        <Select
                          value={selectedCourseId}
                          onChange={(e) => {
                            setSelectedCourseId(e.target.value);
                            setFormData({ ...formData, course: e.target.value, lesson: undefined });
                          }}
                          placeholder="اختر الكورس"
                        >
                          {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                              {course.title}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>الدرس</FormLabel>
                        <Select
                          value={formData.lesson || ''}
                          onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                          placeholder="اختر الدرس"
                          isDisabled={!selectedCourseId}
                        >
                          {lessons.map((lesson) => (
                            <option key={lesson._id} value={lesson._id}>
                              {lesson.title}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {role === UserRole.ADMIN && (
                    <FormControl>
                      <FormLabel>المدرس</FormLabel>
                      <Select
                        value={formData.teacher || ''}
                        onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                        placeholder="اختر المدرس"
                      >
                        {teachers.map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </HStack>
              </Stack>

              <Divider />

              {/* Creation Methods */}
              <Tabs index={activeTab} onChange={setActiveTab}>
                <TabList>
                  <Tab onClick={() => setCreationMethod('new')}>أسئلة جديدة</Tab>
                  <Tab onClick={() => setCreationMethod('bank')}>من بنك الأسئلة</Tab>
                  <Tab onClick={() => setCreationMethod('pdf')}>PDF فقط</Tab>
                  <Tab onClick={() => setCreationMethod('true_false')}>صحيح/خطأ</Tab>
                </TabList>

                <TabPanels>
                  {/* Method 1: New Questions */}
                  <TabPanel>
                    <Stack spacing={4}>
                      <Button
                        leftIcon={<Icon icon="lucide:plus" />}
                        onClick={addNewQuestion}
                        colorScheme="blue"
                        size="sm"
                      >
                        إضافة سؤال جديد
                      </Button>

                      {newQuestions.map((q, qIdx) => (
                        <Box key={qIdx} p={4} border="1px" borderColor="gray.200" rounded="md">
                          <Stack spacing={3}>
                            <HStack justify="space-between">
                              <Text fontWeight="bold">السؤال {qIdx + 1}</Text>
                              <IconButton
                                icon={<Icon icon="lucide:trash-2" />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => {
                                  setNewQuestions(newQuestions.filter((_, i) => i !== qIdx));
                                }}
                                aria-label="حذف السؤال"
                              />
                            </HStack>

                            <FormControl>
                              <FormLabel>نص السؤال</FormLabel>
                              <Textarea
                                value={q.question}
                                onChange={(e) => updateNewQuestion(qIdx, 'question', e.target.value)}
                                placeholder="أدخل نص السؤال"
                              />
                            </FormControl>

                            <HStack>
                              <FormControl>
                                <FormLabel>نوع السؤال</FormLabel>
                                <Select
                                  value={q.questionType}
                                  onChange={(e) => {
                                    const type = e.target.value as any;
                                    updateNewQuestion(qIdx, 'questionType', type);
                                    if (type === 'true_false') {
                                      updateNewQuestion(qIdx, 'answers', [
                                        { text: 'صحيح', isCorrect: true, order: 1 },
                                        { text: 'خطأ', isCorrect: false, order: 2 },
                                      ]);
                                    }
                                  }}
                                >
                                  <option value="mcq">اختيار من متعدد</option>
                                  <option value="true_false">صحيح/خطأ</option>
                                  <option value="written">مقالي</option>
                                </Select>
                              </FormControl>

                              <FormControl>
                                <FormLabel>النقاط</FormLabel>
                                <NumberInput
                                  value={q.points}
                                  onChange={(_, val) => updateNewQuestion(qIdx, 'points', val)}
                                  min={1}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>

                              <FormControl>
                                <FormLabel>الصعوبة</FormLabel>
                                <Select
                                  value={q.difficulty}
                                  onChange={(e) => updateNewQuestion(qIdx, 'difficulty', e.target.value)}
                                >
                                  <option value="easy">سهل</option>
                                  <option value="medium">متوسط</option>
                                  <option value="hard">صعب</option>
                                </Select>
                              </FormControl>
                            </HStack>

                            {q.questionType === 'mcq' && (
                              <Stack spacing={2}>
                                <HStack justify="space-between">
                                  <FormLabel>الإجابات</FormLabel>
                                  <Button
                                    size="xs"
                                    leftIcon={<Icon icon="lucide:plus" />}
                                    onClick={() => addAnswerToQuestion(qIdx)}
                                  >
                                    إضافة إجابة
                                  </Button>
                                </HStack>
                                {q.answers.map((answer, aIdx) => (
                                  <HStack key={aIdx}>
                                    <Input
                                      value={answer.text}
                                      onChange={(e) => {
                                        const updated = [...newQuestions];
                                        updated[qIdx].answers[aIdx].text = e.target.value;
                                        setNewQuestions(updated);
                                      }}
                                      placeholder={`الإجابة ${aIdx + 1}`}
                                    />
                                    <Checkbox
                                      isChecked={answer.isCorrect}
                                      onChange={(e) => {
                                        const updated = [...newQuestions];
                                        updated[qIdx].answers[aIdx].isCorrect = e.target.checked;
                                        setNewQuestions(updated);
                                      }}
                                    >
                                      صحيح
                                    </Checkbox>
                                    {q.answers.length > 2 && (
                                      <IconButton
                                        icon={<Icon icon="lucide:trash-2" />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => removeAnswerFromQuestion(qIdx, aIdx)}
                                        aria-label="حذف الإجابة"
                                      />
                                    )}
                                  </HStack>
                                ))}
                              </Stack>
                            )}

                            {q.questionType === 'written' && (
                              <FormControl>
                                <FormLabel>الإجابة الصحيحة (مرجعية)</FormLabel>
                                <Textarea
                                  value={q.correctAnswer || ''}
                                  onChange={(e) => updateNewQuestion(qIdx, 'correctAnswer', e.target.value)}
                                  placeholder="الإجابة المرجعية (اختياري)"
                                />
                              </FormControl>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </TabPanel>

                  {/* Method 2: From Bank */}
                  <TabPanel>
                    <Stack spacing={4}>
                      <HStack>
                        <FormControl>
                          <FormLabel>نوع السؤال</FormLabel>
                          <Select
                            value={bankFilters.questionType}
                            onChange={(e) => setBankFilters({ ...bankFilters, questionType: e.target.value as any })}
                            placeholder="الكل"
                          >
                            <option value="">الكل</option>
                            <option value="mcq">اختيار من متعدد</option>
                            <option value="true_false">صحيح/خطأ</option>
                            <option value="written">مقالي</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>الصعوبة</FormLabel>
                          <Select
                            value={bankFilters.difficulty}
                            onChange={(e) => setBankFilters({ ...bankFilters, difficulty: e.target.value as any })}
                            placeholder="الكل"
                          >
                            <option value="">الكل</option>
                            <option value="easy">سهل</option>
                            <option value="medium">متوسط</option>
                            <option value="hard">صعب</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>النقاط لكل سؤال</FormLabel>
                          <NumberInput
                            value={generateCriteria.pointsPerQuestion}
                            onChange={(_, val) => setGenerateCriteria({ ...generateCriteria, pointsPerQuestion: val })}
                            min={1}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </HStack>

                      <Box maxH="400px" overflowY="auto" border="1px" borderColor="gray.200" rounded="md" p={4}>
                        <Stack spacing={2}>
                          {bankQuestions.map((question) => (
                            <HStack
                              key={question._id}
                              p={3}
                              border="1px"
                              borderColor={selectedQuestions.includes(question._id) ? 'blue.500' : 'gray.200'}
                              rounded="md"
                              cursor="pointer"
                              onClick={() => toggleQuestionSelection(question._id)}
                              _hover={{ bg: 'gray.50' }}
                            >
                              <Checkbox
                                isChecked={selectedQuestions.includes(question._id)}
                                onChange={() => toggleQuestionSelection(question._id)}
                              />
                              <Box flex={1}>
                                <Text fontWeight="medium" noOfLines={2}>
                                  {question.question}
                                </Text>
                                <HStack mt={1}>
                                  <Badge>{question.questionType}</Badge>
                                  <Badge colorScheme={question.difficulty === 'easy' ? 'green' : question.difficulty === 'medium' ? 'yellow' : 'red'}>
                                    {question.difficulty}
                                  </Badge>
                                  <Badge>{question.points} نقطة</Badge>
                                </HStack>
                              </Box>
                            </HStack>
                          ))}
                        </Stack>
                      </Box>

                      <Text fontSize="sm" color="gray.500">
                        تم اختيار {selectedQuestions.length} سؤال
                      </Text>
                    </Stack>
                  </TabPanel>

                  {/* Method 3: PDF Only */}
                  <TabPanel>
                    <FormControl isRequired>
                      <FormLabel>ملف PDF</FormLabel>
                      <Input
                        ref={pdfInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.type === 'application/pdf') {
                              setPdfFile(file);
                              setPdfPreview(file.name);
                            } else {
                              toast({
                                status: 'error',
                                description: 'الرجاء اختيار ملف PDF',
                              });
                            }
                          }
                        }}
                        display="none"
                      />
                      <Stack direction="row" spacing={2} align="center">
                        <Button
                          size="sm"
                          onClick={() => pdfInputRef.current?.click()}
                          type="button"
                        >
                          {pdfFile ? 'تغيير الملف' : 'اختر ملف PDF'}
                        </Button>
                        {pdfFile && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              setPdfFile(null);
                              setPdfPreview(null);
                              if (pdfInputRef.current) {
                                pdfInputRef.current.value = '';
                              }
                            }}
                            type="button"
                          >
                            إزالة
                          </Button>
                        )}
                      </Stack>
                      {pdfPreview && (
                        <Stack mt={2} spacing={2}>
                          <Text fontSize="sm" color="gray.600">
                            {typeof pdfPreview === 'string' && (pdfPreview.startsWith('http') || pdfPreview.startsWith('/')) ? 'الملف الحالي:' : 'الملف المحدد:'} {typeof pdfPreview === 'string' && (pdfPreview.startsWith('http') || pdfPreview.startsWith('/')) ? '' : pdfPreview}
                          </Text>
                          {typeof pdfPreview === 'string' && (pdfPreview.startsWith('http') || pdfPreview.startsWith('/')) && (
                            <Button
                              size="sm"
                              as="a"
                              href={getImageUrl(pdfPreview)}
                              target="_blank"
                              rel="noopener noreferrer"
                              leftIcon={<Icon icon="solar:file-download-bold" width="16" height="16" />}
                            >
                              عرض/تحميل PDF الحالي
                            </Button>
                          )}
                        </Stack>
                      )}
                    </FormControl>
                  </TabPanel>

                  {/* Method 4: True/False */}
                  <TabPanel>
                    <Stack spacing={4}>
                      <Button
                        leftIcon={<Icon icon="lucide:plus" />}
                        onClick={addTrueFalseQuestion}
                        colorScheme="blue"
                        size="sm"
                      >
                        إضافة سؤال صحيح/خطأ
                      </Button>

                      {trueFalseQuestions.map((q, qIdx) => (
                        <Box key={qIdx} p={4} border="1px" borderColor="gray.200" rounded="md">
                          <Stack spacing={3}>
                            <HStack justify="space-between">
                              <Text fontWeight="bold">السؤال {qIdx + 1}</Text>
                              <IconButton
                                icon={<Icon icon="lucide:trash-2" />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => {
                                  setTrueFalseQuestions(trueFalseQuestions.filter((_, i) => i !== qIdx));
                                }}
                                aria-label="حذف السؤال"
                              />
                            </HStack>

                            <FormControl>
                              <FormLabel>نص السؤال</FormLabel>
                              <Textarea
                                value={q.question}
                                onChange={(e) => updateTrueFalseQuestion(qIdx, 'question', e.target.value)}
                                placeholder="أدخل نص السؤال"
                              />
                            </FormControl>

                            <HStack>
                              <FormControl>
                                <FormLabel>الإجابة الصحيحة</FormLabel>
                                <Select
                                  value={q.correctAnswer ? 'true' : 'false'}
                                  onChange={(e) => updateTrueFalseQuestion(qIdx, 'correctAnswer', e.target.value === 'true')}
                                >
                                  <option value="true">صحيح</option>
                                  <option value="false">خطأ</option>
                                </Select>
                              </FormControl>

                              <FormControl>
                                <FormLabel>النقاط</FormLabel>
                                <NumberInput
                                  value={q.points}
                                  onChange={(_, val) => updateTrueFalseQuestion(qIdx, 'points', val)}
                                  min={1}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>
                            </HStack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Divider />

              {/* Exam Settings */}
              <Stack spacing={4}>
                <Heading size="md">إعدادات الامتحان</Heading>

                <HStack>
                  <FormControl>
                    <FormLabel>مدة الامتحان (دقيقة)</FormLabel>
                    <NumberInput
                      value={formData.settings?.duration || 0}
                      onChange={(_, val) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, duration: val }
                      })}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>درجة النجاح (%)</FormLabel>
                    <NumberInput
                      value={formData.settings?.passingScore || 50}
                      onChange={(_, val) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, passingScore: val }
                      })}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>الحد الأقصى للمحاولات</FormLabel>
                    <NumberInput
                      value={formData.settings?.maxAttempts || 0}
                      onChange={(_, val) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, maxAttempts: val }
                      })}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color="gray.500">0 = غير محدود</Text>
                  </FormControl>
                </HStack>

                <Stack>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>إظهار النتائج</FormLabel>
                    <Switch
                      isChecked={formData.settings?.showResults}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, showResults: e.target.checked }
                      })}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>إظهار الإجابات الصحيحة</FormLabel>
                    <Switch
                      isChecked={formData.settings?.showCorrectAnswers}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, showCorrectAnswers: e.target.checked }
                      })}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>السماح بإعادة المحاولة</FormLabel>
                    <Switch
                      isChecked={formData.settings?.allowRetake}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, allowRetake: e.target.checked }
                      })}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>خلط الأسئلة</FormLabel>
                    <Switch
                      isChecked={formData.settings?.shuffleQuestions}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, shuffleQuestions: e.target.checked }
                      })}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>خلط الإجابات</FormLabel>
                    <Switch
                      isChecked={formData.settings?.shuffleAnswers}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, shuffleAnswers: e.target.checked }
                      })}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>إلزام الإجابة على جميع الأسئلة</FormLabel>
                    <Switch
                      isChecked={formData.settings?.requireAll}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings!, requireAll: e.target.checked }
                      })}
                    />
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              إلغاء
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
              إنشاء الامتحان
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

