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
  Box,
  Badge,
  IconButton,
  Divider,
  useDisclosure,
  Heading,
  Text,
  Grid,
  Image,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import examService from '@/features/teacher/services/examService';
import courseService from '@/features/teacher/services/courseService';
import { coursesService } from '@/features/admin/services/coursesService';
import { axiosInstance, getImageUrl } from '@/lib/axios';
import { ICreateExamRequest, IQuestionBankResponse, IAnswer } from '@/types/exam.types';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import userService from '@/features/user/userService';
import { teachersService } from '@/features/admin/services/teachersService';

interface CreateExamProps {
  onSuccess: () => void;
  trigger: React.ReactElement;
  examId?: string; // For editing
}

type CreationMethod = 'new' | 'bank' | 'pdf' | 'true_false';

export default function CreateExam({ onSuccess, trigger, examId }: CreateExamProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { role } = useAuth();
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
    questionType: 'mcq' | 'true_false';
    answers: IAnswer[];
    correctAnswer?: string;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard';
    imageFile?: File | null;
    imagePreview?: string | null;
    imageUrl?: string;
  }>>([]);

  // For bank questions method
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [bankQuestions, setBankQuestions] = useState<IQuestionBankResponse[]>([]);
  const [bankFilters, setBankFilters] = useState({
    page: 1,
    limit: 20,
    questionType: '' as 'mcq' | 'true_false' | '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | '',
  });
  const [generateCriteria, setGenerateCriteria] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    pointsPerQuestion: 1,
  });
  const [availableQuestionCounts, setAvailableQuestionCounts] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
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

  // Refetch courses when teacher changes (for admin)
  const selectedTeacherId = formData.teacher;
  useEffect(() => {
    if (isOpen && role === UserRole.ADMIN && selectedTeacherId) {
      fetchCourses();
      // Reset course selection when teacher changes
      setSelectedCourseId('');
      setFormData(prev => ({ ...prev, course: undefined, lesson: undefined }));
    }
  }, [selectedTeacherId, isOpen, role]);

  useEffect(() => {
    if (isOpen && creationMethod === 'bank') {
      // Only fetch questions if teacher is selected (for admin) or if not admin
      if (role === UserRole.ADMIN) {
        if (formData.teacher) {
          fetchBankQuestions();
        } else {
          // Clear questions if no teacher selected
          setBankQuestions([]);
        }
      } else {
        // For teachers, fetch their own questions
        fetchBankQuestions();
      }
    }
  }, [isOpen, creationMethod, bankFilters, formData.teacher, role]);

  const fetchCourses = async () => {
    try {
      if (role === UserRole.ADMIN && formData.teacher) {
        // For admin, fetch courses for selected teacher
        const response = await coursesService.getAllCourses({
          page: 1,
          limit: 1000,
          teacher: formData.teacher
        });
        if (response.success && response.data) {
          setCourses(response.data.courses || []);
        }
      } else {
        // For teacher, fetch their own courses
        const response = await courseService.getMyCourses({ limit: 100 });
        setCourses(response.data.courses || []);
      }
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
      if (role === UserRole.ADMIN) {
        const response = await teachersService.getAllTeachers({ limit: 1000 });
        if (response.success && response.data) {
          setTeachers(response.data.teachers || []);
        }
      } else {
        const response = await userService.getAllTeachers({ limit: 100 });
        setTeachers(response.data.teachers || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const fetchBankQuestions = async () => {
    try {
      const query: any = {
        page: bankFilters.page,
        limit: bankFilters.limit,
        questionType: bankFilters.questionType || undefined,
        difficulty: bankFilters.difficulty || undefined,
        activeOnly: true,
      };

      // Filter by teacher if selected (for admin)
      if (role === UserRole.ADMIN && formData.teacher) {
        query.teacher = formData.teacher;
      }

      const response = await examService.getQuestions(query);
      setBankQuestions(response.data.questions || []);

      // Calculate available question counts by difficulty
      const counts = {
        easy: 0,
        medium: 0,
        hard: 0,
      };

      // Fetch all questions to get accurate counts (not just current page)
      const countQuery: any = {
        page: 1,
        limit: 10000, // Get all questions for counting
        activeOnly: true,
      };

      if (role === UserRole.ADMIN && formData.teacher) {
        countQuery.teacher = formData.teacher;
      }

      const countResponse = await examService.getQuestions(countQuery);
      const allQuestions = countResponse.data.questions || [];

      allQuestions.forEach((q: IQuestionBankResponse) => {
        if (q.difficulty === 'easy') counts.easy++;
        else if (q.difficulty === 'medium') counts.medium++;
        else if (q.difficulty === 'hard') counts.hard++;
      });

      setAvailableQuestionCounts(counts);
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

    if (role === UserRole.ADMIN && !formData.teacher) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار المدرس',
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
          // Validate: must have either question text or image
          if (!q.question?.trim() && !q.imageFile && !q.imageUrl) {
            toast({
              title: 'خطأ',
              description: `السؤال ${questionIds.length + 1}: يجب إدخال نص السؤال أو رفع صورة`,
              status: 'error',
            });
            setLoading(false);
            return;
          }

          // Upload image if provided
          let imageUrl = q.imageUrl;
          if (q.imageFile) {
            try {
              const formData = new FormData();
              formData.append('image', q.imageFile);
              const uploadResponse = await axiosInstance.post('/uploads/question-image', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });
              imageUrl = uploadResponse.data.url || uploadResponse.data.data?.url || '';
            } catch (error) {
              toast({
                title: 'خطأ',
                description: `فشل رفع صورة السؤال ${questionIds.length + 1}`,
                status: 'error',
              });
              setLoading(false);
              return;
            }
          }

          const questionData = {
            question: q.question?.trim() || '',
            questionType: q.questionType,
            answers: q.answers,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty,
            points: q.points,
            imageUrl: imageUrl || undefined,
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
        // Check if using random generation
        const totalRandom = (generateCriteria.easy || 0) + (generateCriteria.medium || 0) + (generateCriteria.hard || 0);

        if (totalRandom > 0) {
          // Use random generation
          const generateData = {
            title: formData.title || '',
            description: formData.description,
            examType: formData.examType || 'general',
            course: formData.course,
            lesson: formData.lesson,
            criteria: {
              easy: generateCriteria.easy || 0,
              medium: generateCriteria.medium || 0,
              hard: generateCriteria.hard || 0,
            },
            pointsPerQuestion: generateCriteria.pointsPerQuestion,
            settings: {
              ...formData.settings,
              shuffleQuestions: true, // Always shuffle for random exams
            },
            teacher: role === UserRole.ADMIN ? formData.teacher : undefined,
          };

          await examService.generateExam(generateData);
        } else if (selectedQuestions.length === 0) {
          toast({
            title: 'خطأ',
            description: 'يجب اختيار سؤال واحد على الأقل أو تحديد عدد الأسئلة للإنشاء العشوائي',
            status: 'error',
          });
          setLoading(false);
          return;
        } else {
          // Use manual selection
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
        }
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
      imageFile: null,
      imagePreview: null,
      imageUrl: undefined,
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
                    <FormControl isRequired>
                      <FormLabel>المدرس</FormLabel>
                      <Select
                        value={formData.teacher || ''}
                        onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                        placeholder="اختر المدرس"
                      >
                        <option value="">-- اختر المدرس --</option>
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
                              <FormLabel>نص السؤال (اختياري إذا تم رفع صورة)</FormLabel>
                              <Textarea
                                value={q.question}
                                onChange={(e) => updateNewQuestion(qIdx, 'question', e.target.value)}
                                placeholder="أدخل نص السؤال أو ارفع صورة أدناه"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>صورة السؤال (اختياري إذا تم إدخال نص)</FormLabel>
                              <Input
                                type="file"
                                accept="image/*"
                                display="none"
                                id={`question-image-${qIdx}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.type.startsWith('image/')) {
                                      updateNewQuestion(qIdx, 'imageFile', file);
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        updateNewQuestion(qIdx, 'imagePreview', reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    } else {
                                      toast({
                                        title: 'خطأ',
                                        description: 'الرجاء اختيار ملف صورة',
                                        status: 'error',
                                      });
                                    }
                                  }
                                }}
                              />
                              <HStack spacing={2}>
                                <Button
                                  as="label"
                                  htmlFor={`question-image-${qIdx}`}
                                  size="sm"
                                  leftIcon={<Icon icon="solar:gallery-bold-duotone" width="16" height="16" />}
                                  cursor="pointer"
                                  variant="outline"
                                >
                                  {q.imagePreview ? 'تغيير الصورة' : 'اختر صورة'}
                                </Button>
                                {q.imagePreview && (
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => {
                                      updateNewQuestion(qIdx, 'imageFile', null);
                                      updateNewQuestion(qIdx, 'imagePreview', null);
                                      updateNewQuestion(qIdx, 'imageUrl', undefined);
                                    }}
                                  >
                                    إزالة
                                  </Button>
                                )}
                              </HStack>
                              {q.imagePreview && (
                                <Box mt={2}>
                                  <Image src={q.imagePreview} alt="Preview" maxH="200px" borderRadius="md" />
                                </Box>
                              )}
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

                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </TabPanel>

                  {/* Method 2: From Bank */}
                  <TabPanel>
                    <Stack spacing={4}>
                      {/* Teacher Selection Required for Admin */}
                      {role === UserRole.ADMIN && !formData.teacher && (
                        <Box p={4} bg="orange.50" borderRadius="lg" border="1px" borderColor="orange.200">
                          <HStack spacing={3} mb={3}>
                            <Icon icon="solar:info-circle-bold-duotone" width="24" height="24" style={{ color: 'var(--chakra-colors-orange-600)' }} />
                            <Heading size="sm" color="orange.700">
                              يجب اختيار المدرس أولاً
                            </Heading>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mb={4}>
                            يرجى اختيار المدرس من الأعلى لعرض أسئلته من بنك الأسئلة
                          </Text>
                        </Box>
                      )}

                      {((role === UserRole.ADMIN && formData.teacher) || role !== UserRole.ADMIN) && (
                        <>
                          <Box p={4} bg="purple.50" borderRadius="lg" border="1px" borderColor="purple.200">
                            <Heading size="sm" mb={3} color="purple.700">
                              إنشاء امتحان عشوائي من بنك الأسئلة
                            </Heading>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                              اختر عدد الأسئلة لكل مستوى صعوبة. سيتم اختيار الأسئلة بشكل عشوائي وخلطها تلقائياً.
                            </Text>
                            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                              <FormControl>
                                <FormLabel>
                                  عدد الأسئلة السهلة
                                  {availableQuestionCounts.easy > 0 && (
                                    <Text as="span" fontSize="xs" color="gray.500" fontWeight="normal" mr={2}>
                                      (المتاح: {availableQuestionCounts.easy})
                                    </Text>
                                  )}
                                </FormLabel>
                                <NumberInput
                                  value={generateCriteria.easy}
                                  onChange={(_, val) => {
                                    const numVal = isNaN(val) ? 0 : val;
                                    const maxVal = Math.min(Math.max(0, numVal), availableQuestionCounts.easy);
                                    setGenerateCriteria({ ...generateCriteria, easy: maxVal });
                                  }}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const maxVal = Math.min(val, availableQuestionCounts.easy);
                                    if (val !== maxVal) {
                                      setGenerateCriteria({ ...generateCriteria, easy: maxVal });
                                    }
                                  }}
                                  min={0}
                                  max={availableQuestionCounts.easy}
                                  isDisabled={availableQuestionCounts.easy === 0}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                                {availableQuestionCounts.easy === 0 && (
                                  <Text fontSize="xs" color="orange.500" mt={1}>
                                    لا توجد أسئلة سهلة متاحة
                                  </Text>
                                )}
                              </FormControl>
                              <FormControl>
                                <FormLabel>
                                  عدد الأسئلة المتوسطة
                                  {availableQuestionCounts.medium > 0 && (
                                    <Text as="span" fontSize="xs" color="gray.500" fontWeight="normal" mr={2}>
                                      (المتاح: {availableQuestionCounts.medium})
                                    </Text>
                                  )}
                                </FormLabel>
                                <NumberInput
                                  value={generateCriteria.medium}
                                  onChange={(_, val) => {
                                    const numVal = isNaN(val) ? 0 : val;
                                    const maxVal = Math.min(Math.max(0, numVal), availableQuestionCounts.medium);
                                    setGenerateCriteria({ ...generateCriteria, medium: maxVal });
                                  }}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const maxVal = Math.min(val, availableQuestionCounts.medium);
                                    if (val !== maxVal) {
                                      setGenerateCriteria({ ...generateCriteria, medium: maxVal });
                                    }
                                  }}
                                  min={0}
                                  max={availableQuestionCounts.medium}
                                  isDisabled={availableQuestionCounts.medium === 0}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                                {availableQuestionCounts.medium === 0 && (
                                  <Text fontSize="xs" color="orange.500" mt={1}>
                                    لا توجد أسئلة متوسطة متاحة
                                  </Text>
                                )}
                              </FormControl>
                              <FormControl>
                                <FormLabel>
                                  عدد الأسئلة الصعبة
                                  {availableQuestionCounts.hard > 0 && (
                                    <Text as="span" fontSize="xs" color="gray.500" fontWeight="normal" mr={2}>
                                      (المتاح: {availableQuestionCounts.hard})
                                    </Text>
                                  )}
                                </FormLabel>
                                <NumberInput
                                  value={generateCriteria.hard}
                                  onChange={(_, val) => {
                                    const numVal = isNaN(val) ? 0 : val;
                                    const maxVal = Math.min(Math.max(0, numVal), availableQuestionCounts.hard);
                                    setGenerateCriteria({ ...generateCriteria, hard: maxVal });
                                  }}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const maxVal = Math.min(val, availableQuestionCounts.hard);
                                    if (val !== maxVal) {
                                      setGenerateCriteria({ ...generateCriteria, hard: maxVal });
                                    }
                                  }}
                                  min={0}
                                  max={availableQuestionCounts.hard}
                                  isDisabled={availableQuestionCounts.hard === 0}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                                {availableQuestionCounts.hard === 0 && (
                                  <Text fontSize="xs" color="orange.500" mt={1}>
                                    لا توجد أسئلة صعبة متاحة
                                  </Text>
                                )}
                              </FormControl>
                            </Grid>
                            <FormControl mt={4}>
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
                            <HStack justify="space-between" mt={2}>
                              <Text fontSize="xs" color="gray.500">
                                إجمالي الأسئلة: {generateCriteria.easy + generateCriteria.medium + generateCriteria.hard}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                المتاح: {availableQuestionCounts.easy + availableQuestionCounts.medium + availableQuestionCounts.hard}
                              </Text>
                            </HStack>
                            {(generateCriteria.easy > availableQuestionCounts.easy ||
                              generateCriteria.medium > availableQuestionCounts.medium ||
                              generateCriteria.hard > availableQuestionCounts.hard) && (
                                <Text fontSize="xs" color="red.500" mt={1}>
                                  ⚠️ العدد المدخل يتجاوز المتاح. سيتم استخدام الحد الأقصى المتاح.
                                </Text>
                              )}
                          </Box>

                          <Divider />

                          <Box>
                            <Heading size="sm" mb={3}>
                              أو اختر الأسئلة يدوياً
                            </Heading>
                            <HStack mb={4}>
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
                            </HStack>

                            <Box maxH="400px" overflowY="auto" border="1px" borderColor="gray.200" rounded="md" p={4}>
                              {bankQuestions.length === 0 ? (
                                <Box textAlign="center" py={8}>
                                  <Text color="gray.500">لا توجد أسئلة متاحة</Text>
                                </Box>
                              ) : (
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
                              )}
                            </Box>

                            <Text fontSize="sm" color="gray.500" mt={2}>
                              تم اختيار {selectedQuestions.length} سؤال
                            </Text>
                          </Box>
                        </>
                      )}
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

