import {
  useState,
  useEffect,
  // useRef
} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  // ModalFooter,
  // ModalCloseButton,
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
  SimpleGrid,
  Card,
  CardBody,
  // VStack,
  Container,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import examService from '@/features/teacher/services/examService';
import courseService from '@/features/teacher/services/courseService';
import { coursesService } from '@/features/admin/services/coursesService';
import { 
  axiosInstance,
  // getImageUrl
} from '@/lib/axios';
import { ICreateExamRequest, IQuestionBankResponse, IAnswer } from '@/types/exam.types';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import userService from '@/features/user/userService';
import { teachersService } from '@/features/admin/services/teachersService';

interface CreateExamProps {
  onSuccess: () => void;
  trigger: React.ReactElement;
  examId?: string; // For editing
}

type CreationMethod = 'new' | 'bank' | 'pdf';

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
      requiredBeforeNextLesson: false,
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
  // const pdfInputRef = useRef<HTMLInputElement>(null);

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
          requiredBeforeNextLesson: false,
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

  const handleSubmit = async (status: 'published' | 'draft' = 'published') => {
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
        const questionIds: string[] = [];
        for (const q of newQuestions) {
          if (!q.question?.trim() && !q.imageFile && !q.imageUrl) {
            toast({
              title: 'خطأ',
              description: `السؤال ${questionIds.length + 1}: يجب إدخال نص السؤال أو رفع صورة`,
              status: 'error',
            });
            setLoading(false);
            return;
          }

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

        await examService.createExam({ ...examData, status });
      } else if (creationMethod === 'bank') {
        const totalRandom = (generateCriteria.easy || 0) + (generateCriteria.medium || 0) + (generateCriteria.hard || 0);

        if (totalRandom > 0) {
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
              shuffleQuestions: true,
            },
            teacher: role === UserRole.ADMIN ? formData.teacher : undefined,
          };

          await examService.generateExam({ ...generateData, status });
        } else if (selectedQuestions.length === 0) {
          toast({
            title: 'خطأ',
            description: 'يجب اختيار سؤال واحد على الأقل أو تحديد عدد الأسئلة للإنشاء العشوائي',
            status: 'error',
          });
          setLoading(false);
          return;
        } else {
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

          await examService.createExam({ ...examData, status });
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
        formDataObj.append('status', status);
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
      }

      toast({
        title: 'نجح',
        description: 'تم التعامل مع الامتحان بنجاح',
        status: 'success',
      });
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في حفظ الامتحان',
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
        requiredBeforeNextLesson: false,
      },
    });
    setNewQuestions([]);
    setSelectedQuestions([]);
    setPdfFile(null);
    setPdfPreview(null);
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
    
    // Handle special case for type switching
    if (field === 'questionType') {
        if (value === 'true_false') {
             updated[index].answers = [
                { text: 'صحيح', isCorrect: true, order: 1 },
                { text: 'خطأ', isCorrect: false, order: 2 },
            ];
        } else if (value === 'mcq') {
             // Reset to at least 2 empty answers for MCQ
             updated[index].answers = [
                { text: '', isCorrect: false, order: 1 },
                { text: '', isCorrect: false, order: 2 },
            ];
        }
    }

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

      <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
        <ModalContent dir="rtl" minH="100vh" borderRadius={0} bg="gray.50">
          
          {/* Header */}
          <ModalHeader p={0}>
              <Box 
                bgGradient="linear(to-r, teal.600, blue.500)" 
                color="white" 
                px={{ base: 4, md: 8 }} 
                py={{ base: 4, md: 6 }}
                shadow="md"
              >
                  <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} spacing={4}>
                    <HStack spacing={4}>
                      <Box p={3} bg="whiteAlpha.200" borderRadius="xl" display={{ base: 'none', md: 'block' }}>
                        <Icon icon="solar:document-add-bold-duotone" width={32} height={32} />
                      </Box>
                      <Box>
                        <Heading size={{ base: 'md', md: 'lg' }} fontWeight="bold">{examId ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}</Heading>
                        <Text opacity={0.9} fontSize="sm" mt={1} display={{ base: 'none', md: 'block' }}>قم بإدخال تفاصيل الامتحان والأسئلة المرتبطة به</Text>
                      </Box>
                    </HStack>
                    
                    <Stack direction={{ base: 'row-reverse', md: 'row' }} spacing={2} w={{ base: 'full', md: 'auto' }} justify={{ base: 'space-between', md: 'flex-start' }}>
                      <Button variant="ghost" color="white" onClick={onClose} _hover={{ bg: "whiteAlpha.200" }} size={{ base: 'sm', md: 'md' }}>
                           إلغاء
                      </Button>
                      <Button 
                        colorScheme="orange" 
                        variant="solid" 
                        leftIcon={<Icon icon="solar:diskette-bold-duotone" width="18" />}
                        onClick={() => handleSubmit('draft')}
                        isLoading={loading}
                        boxShadow="lg"
                        _hover={{ transform: 'translateY(-2px)' }}
                        size={{ base: 'sm', md: 'md' }}
                      >
                         مسودة
                      </Button>
                      <Button 
                        bg="white" 
                        color="teal.600" 
                        leftIcon={<Icon icon="solar:plain-bold-duotone" width="18" />}
                        onClick={() => handleSubmit('published')}
                        isLoading={loading}
                        boxShadow="lg"
                        _hover={{ transform: 'translateY(-2px)', bg: 'gray.100' }}
                        size={{ base: 'sm', md: 'md' }}
                      >
                        نشر
                      </Button>
                    </Stack>
                  </Stack>
              </Box>
          </ModalHeader>

          <ModalBody p={0} bg="gray.50">
            <Container maxW="8xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }}>
                <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={{ base: 6, lg: 8 }}>
                    {/* Sidebar / Settings */}
                    <Stack spacing={6} order={{ base: 2, lg: 1 }}>
                        <Card shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                            <CardBody>
                                <Stack spacing={5}>
                                    <Heading size="sm" color="gray.700">بيانات الامتحان</Heading>
                                    
                                     <FormControl isRequired>
                                        <FormLabel fontSize="sm" color="gray.600">عنوان الامتحان</FormLabel>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="أدخل عنوان مميز"
                                            size="lg"
                                            variant="filled"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" color="gray.600">الوصف</FormLabel>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="وصف مختصر لمحتوى الامتحان"
                                            variant="filled"
                                            rows={2}
                                        />
                                    </FormControl>

                                    <Divider />

                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" color="gray.600">نوع الارتباط</FormLabel>
                                        <Select
                                            value={formData.examType}
                                            onChange={(e) => {
                                                const examType = e.target.value as any;
                                                setFormData({ ...formData, examType, course: undefined, lesson: undefined });
                                                setSelectedCourseId('');
                                            }}
                                            variant="filled"
                                            size="md"
                                        >
                                            <option value="general">عام (غير مرتبط)</option>
                                            <option value="course">مرتبط بكورس</option>
                                            <option value="lesson">مرتبط بدرس</option>
                                        </Select>
                                    </FormControl>

                                    {(formData.examType === 'course' || formData.examType === 'lesson') && (
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" color="gray.600">الكورس</FormLabel>
                                            <Select
                                                value={selectedCourseId}
                                                onChange={(e) => {
                                                    setSelectedCourseId(e.target.value);
                                                    setFormData({ ...formData, course: e.target.value, lesson: undefined });
                                                }}
                                                placeholder="اختر الكورس"
                                                variant="filled"
                                            >
                                                {courses.map((course) => (
                                                    <option key={course._id} value={course._id}>{course.title}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}

                                    {formData.examType === 'lesson' && (
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" color="gray.600">الدرس</FormLabel>
                                            <Select
                                                value={formData.lesson || ''}
                                                onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                                                placeholder="اختر الدرس"
                                                isDisabled={!selectedCourseId}
                                                variant="filled"
                                            >
                                                {lessons.map((lesson) => (
                                                    <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}

                                    {role === UserRole.ADMIN && (
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" color="gray.600">المدرس</FormLabel>
                                            <Select
                                                value={formData.teacher || ''}
                                                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                                placeholder="اختر المدرس"
                                                variant="filled"
                                            >
                                                {teachers.map((t) => (
                                                    <option key={t._id} value={t._id}>{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim()}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </Stack>
                            </CardBody>
                        </Card>

                        <Card shadow="sm" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                             <CardBody>
                                <Stack spacing={4}>
                                    <Heading size="sm" color="gray.700">الإعدادات</Heading>
                                    
                                     <FormControl>
                                        <FormLabel fontSize="sm" color="gray.600">المدة (دقيقة)</FormLabel>
                                        <InputGroup size="md">
                                             <InputLeftElement pointerEvents="none" color="gray.400">
                                                  <Icon icon="solar:clock-circle-bold-duotone" />
                                             </InputLeftElement>
                                             <NumberInput
                                                w="full"
                                                value={formData.settings?.duration || 0}
                                                onChange={(_, val) => setFormData({
                                                    ...formData,
                                                    settings: { ...formData.settings!, duration: val }
                                                })}
                                                min={0}
                                            >
                                                <NumberInputField pl={10} placeholder="0 = غير محدود" />
                                            </NumberInput>
                                        </InputGroup>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" color="gray.600">درجة النجاح (%)</FormLabel>
                                         <InputGroup size="md">
                                             <InputLeftElement pointerEvents="none" color="gray.400">
                                                  <Icon icon="solar:verified-check-bold" />
                                             </InputLeftElement>
                                            <NumberInput
                                                w="full"
                                                value={formData.settings?.passingScore || 50}
                                                onChange={(_, val) => setFormData({
                                                    ...formData,
                                                    settings: { ...formData.settings!, passingScore: val }
                                                })}
                                                min={0}
                                                max={100}
                                            >
                                                <NumberInputField pl={10} />
                                            </NumberInput>
                                        </InputGroup>
                                    </FormControl>

                                    <Divider my={2} />

                                    <Stack spacing={3}>
                                         {[
                                            { label: 'إظهار النتائج', key: 'showResults', icon: 'solar:chart-2-bold-duotone' },
                                            { label: 'إظهار الحل الصحيح', key: 'showCorrectAnswers', icon: 'solar:check-read-bold-duotone' },
                                            { label: 'إعادة المحاولة', key: 'allowRetake', icon: 'solar:restart-bold-duotone' },
                                            { label: 'خلط الأسئلة', key: 'shuffleQuestions', icon: 'solar:shuffle-bold-duotone' },
                                            { label: 'خلط الإجابات', key: 'shuffleAnswers', icon: 'solar:sort-from-top-to-bottom-bold-duotone' },
                                            { label: 'إلزام الحل', key: 'requireAll', icon: 'solar:clipboard-check-bold-duotone' },
                                            { label: 'مطلوب لفتح الدرس التالي', key: 'requiredBeforeNextLesson', icon: 'solar:lock-password-bold-duotone' },
                                         ].map((setting) => (
                                              <HStack key={setting.key} justify="space-between">
                                                  <HStack>
                                                      <Icon icon={setting.icon} width="20" color="gray.500" />
                                                      <Text fontSize="sm" color="gray.700">{setting.label}</Text>
                                                  </HStack>
                                                  <Switch 
                                                      size="sm"
                                                      isChecked={formData.settings?.[setting.key as keyof typeof formData.settings] as boolean}
                                                      onChange={(e) => setFormData({
                                                          ...formData,
                                                          settings: { ...formData.settings!, [setting.key]: e.target.checked }
                                                      })}
                                                  />
                                              </HStack>
                                         ))}
                                    </Stack>
                                </Stack>
                             </CardBody>
                        </Card>
                    </Stack>

                    {/* Main Content Area */}
                    <Stack spacing={6} order={{ base: 1, lg: 2 }}>
                        {/* Creation Method Tabs */}
                        <Box bg="white" p={2} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                            <Tabs index={activeTab} onChange={setActiveTab} variant="soft-rounded" colorScheme="teal" size="sm" isFitted>
                                <TabList overflowX="auto" py={1} display="flex" css={{ scrollbarWidth: 'none', '::-webkit-scrollbar': { display: 'none' } }}>
                                    <Tab 
                                        flexShrink={0}
                                        onClick={() => setCreationMethod('new')}
                                        _selected={{ bg: 'teal.50', color: 'teal.600', shadow: 'sm' }}
                                    >
                                        <HStack>
                                            <Icon icon="solar:pen-new-square-bold-duotone" width="20" />
                                            <Text>أسئلة جديدة</Text>
                                        </HStack>
                                    </Tab>
                                    <Tab 
                                        flexShrink={0}
                                        onClick={() => setCreationMethod('bank')}
                                        _selected={{ bg: 'teal.50', color: 'teal.600', shadow: 'sm' }}
                                    >
                                         <HStack>
                                            <Icon icon="solar:library-bold-duotone" width="20" />
                                            <Text>بنك الأسئلة</Text>
                                        </HStack>
                                    </Tab>
                                    <Tab 
                                        flexShrink={0}
                                        onClick={() => setCreationMethod('pdf')}
                                        _selected={{ bg: 'teal.50', color: 'teal.600', shadow: 'sm' }}
                                    >
                                         <HStack>
                                            <Icon icon="solar:file-text-bold-duotone" width="20" />
                                            <Text>PDF</Text>
                                        </HStack>
                                    </Tab>
                                </TabList>

                                <TabPanels mt={4}>
                                    <TabPanel p={0} pt={4}>
                                        <Stack spacing={4}>
                                            {newQuestions.length === 0 && (
                                                <Box textAlign="center" py={12} bg="gray.50" borderRadius="xl" border="2px dashed" borderColor="gray.200">
                                                    <Icon icon="solar:question-circle-bold-duotone" width="48" height="48" style={{ color: '#CBD5E0', margin: '0 auto' }} />
                                                    <Text color="gray.500" mt={4} fontWeight="medium">لم يتم إضافة أي أسئلة بعد</Text>
                                                    <Button mt={4} colorScheme="teal" onClick={addNewQuestion} leftIcon={<Icon icon="solar:add-circle-bold-duotone" />}>
                                                        ابدأ بإضافة سؤال
                                                    </Button>
                                                </Box>
                                            )}

                                            {newQuestions.map((q, qIdx) => (
                                                <Card key={qIdx} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.200" overflow="hidden">
                                                    <Box bg="gray.50" px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                                                         <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={3}>
                                                            <Stack direction="row" flexWrap="wrap" align="center" spacing={2} w="full">
                                                                <Badge colorScheme="teal" borderRadius="full" px={2}>سؤال {qIdx + 1}</Badge>
                                                                <Select 
                                                                    size="xs" 
                                                                    w="auto"
                                                                    minW="120px"
                                                                    bg="white" 
                                                                    value={q.questionType}
                                                                    onChange={(e) => updateNewQuestion(qIdx, 'questionType', e.target.value)}
                                                                >
                                                                    <option value="mcq">اختيار من متعدد</option>
                                                                    <option value="true_false">صحيح/خطأ</option>
                                                                </Select>
                                                                <Select 
                                                                    size="xs" 
                                                                    w="auto"
                                                                    minW="80px"
                                                                    bg="white" 
                                                                    value={q.difficulty}
                                                                    onChange={(e) => updateNewQuestion(qIdx, 'difficulty', e.target.value)}
                                                                >
                                                                    <option value="easy">سهل</option>
                                                                    <option value="medium">متوسط</option>
                                                                    <option value="hard">صعب</option>
                                                                </Select>
                                                            </Stack>
                                                            <IconButton
                                                                icon={<Icon icon="solar:trash-bin-trash-bold-duotone" />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                onClick={() => setNewQuestions(newQuestions.filter((_, i) => i !== qIdx))}
                                                                aria-label="حذف السؤال"
                                                                alignSelf={{ base: 'flex-end', sm: 'auto' }}
                                                            />
                                                         </Stack>
                                                    </Box>
                                                    <CardBody p={5}>
                                                        <Stack spacing={4}>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="أدخل نص السؤال هنا..."
                                                                    value={q.question}
                                                                    onChange={(e) => updateNewQuestion(qIdx, 'question', e.target.value)}
                                                                    borderRadius="lg"
                                                                    bg="white"
                                                                />
                                                            </FormControl>
                                                            <HStack align="start">
                                                                <FormControl w="auto">
                                                                     <Button
                                                                        as="label"
                                                                        htmlFor={`q-img-${qIdx}`}
                                                                        cursor="pointer"
                                                                        size="sm"
                                                                        leftIcon={<Icon icon="solar:camera-minimalistic-bold-duotone" />}
                                                                        variant="outline"
                                                                     >
                                                                        صورة للسؤال
                                                                     </Button>
                                                                     <Input type="file" id={`q-img-${qIdx}`} hidden accept="image/*" onChange={(e) => {
                                                                         const file = e.target.files?.[0];
                                                                         if(file) {
                                                                             updateNewQuestion(qIdx, 'imageFile', file);
                                                                             const reader = new FileReader();
                                                                             reader.onloadend = () => updateNewQuestion(qIdx, 'imagePreview', reader.result);
                                                                             reader.readAsDataURL(file);
                                                                         }
                                                                     }} />
                                                                </FormControl>
                                                                {q.imagePreview && <Image src={q.imagePreview} h="40px" borderRadius="md" />}
                                                            </HStack>

                                                            <Divider />

                                                            {q.questionType === 'mcq' && (
                                                                <Stack spacing={3}>
                                                                    {q.answers.map((ans, aIdx) => (
                                                                        <HStack key={aIdx}>
                                                                            <Tooltip label="إجابة صحيحة؟">
                                                                                <Checkbox 
                                                                                    isChecked={ans.isCorrect}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...newQuestions];
                                                                                        updated[qIdx].answers[aIdx].isCorrect = e.target.checked;
                                                                                        setNewQuestions(updated);
                                                                                    }}
                                                                                    colorScheme="green"
                                                                                    size="lg"
                                                                                />
                                                                            </Tooltip>
                                                                            <Input 
                                                                                placeholder={`الإجابة ${aIdx + 1}`}
                                                                                value={ans.text}
                                                                                onChange={(e) => {
                                                                                    const updated = [...newQuestions];
                                                                                    updated[qIdx].answers[aIdx].text = e.target.value;
                                                                                    setNewQuestions(updated);
                                                                                }}
                                                                            />
                                                                            <IconButton icon={<Icon icon="solar:close-circle-bold-duotone" />} size="sm" variant="ghost" colorScheme="red" aria-label="remove" onClick={() => removeAnswerFromQuestion(qIdx, aIdx)} />
                                                                        </HStack>
                                                                    ))}
                                                                    <Button size="sm" variant="ghost" leftIcon={<Icon icon="solar:add-circle-linear" />} onClick={() => addAnswerToQuestion(qIdx)}>إضافة خيار</Button>
                                                                </Stack>
                                                            )}

                                                            {q.questionType === 'true_false' && (
                                                                <FormControl as="fieldset">
                                                                    <FormLabel as="legend" fontSize="sm" fontWeight="bold">الإجابة الصحيحة:</FormLabel>
                                                                    <RadioGroup 
                                                                        value={q.answers.some(a => a.isCorrect && a.text === 'صحيح') ? 'صحيح' : q.answers.some(a => a.isCorrect && a.text === 'خطأ') ? 'خطأ' : ''} 
                                                                        onChange={(val) => {
                                                                            const updated = [...newQuestions];
                                                                            updated[qIdx].answers = [
                                                                                { text: 'صحيح', isCorrect: val === 'صحيح', order: 1 },
                                                                                { text: 'خطأ', isCorrect: val === 'خطأ', order: 2 }
                                                                            ];
                                                                            setNewQuestions(updated);
                                                                        }}
                                                                    >
                                                                        <HStack spacing={6}>
                                                                            <Radio value="صحيح" colorScheme="green" size="lg">صحيح</Radio>
                                                                            <Radio value="خطأ" colorScheme="red" size="lg">خطأ</Radio>
                                                                        </HStack>
                                                                    </RadioGroup>
                                                                </FormControl>
                                                            )}
                                                        </Stack>
                                                    </CardBody>
                                                </Card>
                                            ))}

                                            {newQuestions.length > 0 && (
                                                <Button size="lg" colorScheme="gray" variant="outline" borderStyle="dashed" onClick={addNewQuestion} leftIcon={<Icon icon="solar:add-circle-bold-duotone" />}>
                                                    إضافة سؤال آخر
                                                </Button>
                                            )}
                                        </Stack>
                                    </TabPanel>

                                    <TabPanel p={0} pt={4}>
                                        <Stack spacing={5}>
                                            <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
                                                 <FormControl>
                                                    <FormLabel fontSize="sm">التصفية حسب نوع السؤال</FormLabel>
                                                    <Select value={bankFilters.questionType} onChange={(e) => setBankFilters({...bankFilters, questionType: e.target.value as any})} fontSize="sm">
                                                        <option value="">الكل</option>
                                                        <option value="mcq">اختيار من متعدد</option>
                                                        <option value="true_false">صواب/خطأ</option>
                                                    </Select>
                                                 </FormControl>
                                                 <FormControl>
                                                    <FormLabel fontSize="sm">التصفية حسب الصعوبة</FormLabel>
                                                    <Select value={bankFilters.difficulty} onChange={(e) => setBankFilters({...bankFilters, difficulty: e.target.value as any})} fontSize="sm">
                                                        <option value="">الكل</option>
                                                        <option value="easy">سهل</option>
                                                        <option value="medium">متوسط</option>
                                                        <option value="hard">صعب</option>
                                                    </Select>
                                                 </FormControl>
                                            </SimpleGrid>

                                            <Card variant="outline">
                                                <CardBody p={4}>
                                                   <Stack spacing={4}>
                                                       <HStack>
                                                           <Icon icon="solar:magic-stick-3-bold-duotone" color="purple.500" width="24" />
                                                           <Heading size="sm">توليد عشوائي</Heading>
                                                       </HStack>
                                                       <SimpleGrid columns={3} spacing={4}>
                                                           <FormControl>
                                                               <FormLabel fontSize="xs">سهل ({availableQuestionCounts.easy})</FormLabel>
                                                               <NumberInput size="sm" min={0} max={availableQuestionCounts.easy} value={generateCriteria.easy} onChange={(_, v) => setGenerateCriteria({...generateCriteria, easy: Number(v)})}>
                                                                   <NumberInputField />
                                                                   <NumberInputStepper><NumberIncrementStepper/><NumberDecrementStepper/></NumberInputStepper>
                                                               </NumberInput>
                                                           </FormControl>
                                                           <FormControl>
                                                               <FormLabel fontSize="xs">متوسط ({availableQuestionCounts.medium})</FormLabel>
                                                               <NumberInput size="sm" min={0} max={availableQuestionCounts.medium} value={generateCriteria.medium} onChange={(_, v) => setGenerateCriteria({...generateCriteria, medium: Number(v)})}>
                                                                   <NumberInputField />
                                                                   <NumberInputStepper><NumberIncrementStepper/><NumberDecrementStepper/></NumberInputStepper>
                                                               </NumberInput>
                                                           </FormControl>
                                                           <FormControl>
                                                               <FormLabel fontSize="xs">صعب ({availableQuestionCounts.hard})</FormLabel>
                                                               <NumberInput size="sm" min={0} max={availableQuestionCounts.hard} value={generateCriteria.hard} onChange={(_, v) => setGenerateCriteria({...generateCriteria, hard: Number(v)})}>
                                                                   <NumberInputField />
                                                                   <NumberInputStepper><NumberIncrementStepper/><NumberDecrementStepper/></NumberInputStepper>
                                                               </NumberInput>
                                                           </FormControl>
                                                       </SimpleGrid>
                                                   </Stack>
                                                </CardBody>
                                            </Card>

                                            <Divider />
                                             <Heading size="sm">أو اختر يدوياً:</Heading>
                                            <Box maxH="500px" overflowY="auto" borderWidth="1px" borderRadius="xl" borderColor="gray.200">
                                                {bankQuestions.map((q) => (
                                                    <HStack key={q._id} p={3} borderBottomWidth="1px" _last={{borderBottomWidth: 0}} _hover={{bg: 'gray.50'}}>
                                                        <Checkbox isChecked={selectedQuestions.includes(q._id)} onChange={() => toggleQuestionSelection(q._id)} />
                                                        <Box flex={1}>
                                                            <Text fontSize="sm" fontWeight="medium">{q.question}</Text>
                                                            <HStack mt={1} spacing={2}>
                                                                <Badge size="sm" colorScheme={q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'yellow' : 'red'}>{q.difficulty}</Badge>
                                                                <Badge size="sm">{q.questionType}</Badge>
                                                            </HStack>
                                                        </Box>
                                                    </HStack>
                                                ))}
                                                {bankQuestions.length === 0 && <Text p={4} textAlign="center" color="gray.500">لا توجد أسئلة</Text>}
                                            </Box>
                                        </Stack>
                                    </TabPanel>

                                    <TabPanel p={0} pt={4}>
                                        <Card variant="outline" borderStyle="dashed" borderWidth="2px">
                                            <CardBody textAlign="center" py={10}>
                                                <Icon icon="solar:file-text-bold-duotone" width="64" height="64" style={{margin: '0 auto', color: '#718096'}} />
                                                <Text mt={4} fontSize="lg" fontWeight="bold">رفع ملف الامتحان (PDF)</Text>
                                                <Text fontSize="sm" color="gray.500" mb={6}>سيتم عرض الملف للطالب للإجابة عليه</Text>
                                                
                                                <FormControl>
                                                    <Input 
                                                        type="file" 
                                                        accept="application/pdf" 
                                                        hidden 
                                                        id="pdf-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if(file) {
                                                                setPdfFile(file);
                                                                setPdfPreview(file.name);
                                                            }
                                                        }} 
                                                    />
                                                    <Stack align="center" spacing={3}>
                                                        <Button as="label" htmlFor="pdf-upload" colorScheme="teal" cursor="pointer" leftIcon={<Icon icon="solar:upload-minimalistic-bold-duotone"/>}>
                                                            {pdfFile ? 'تغيير الملف' : 'اختر ملف PDF'}
                                                        </Button>
                                                        {pdfPreview && (
                                                            <HStack bg="teal.50" px={4} py={2} borderRadius="md">
                                                                <Icon icon="solar:document-bold" color="teal.500" />
                                                                <Text fontSize="sm" color="teal.700" noOfLines={1}>{typeof pdfPreview === 'string' && (pdfPreview.startsWith('http') || pdfPreview.startsWith('/')) ? 'ملف حالي' : pdfPreview}</Text>
                                                            </HStack>
                                                        )}
                                                    </Stack>
                                                </FormControl>
                                            </CardBody>
                                        </Card>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                    </Stack>
                </Grid>
            </Container>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
