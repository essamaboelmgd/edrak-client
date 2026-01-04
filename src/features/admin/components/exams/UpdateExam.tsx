import { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Switch,
    Stack,
    HStack,
    VStack,
    Box,
    Divider,
    useToast,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { useForm, Controller } from 'react-hook-form';
import examService from '@/features/exams/examService';
import { IExamResponse, IUpdateExamRequest } from '@/types/exam.types';
import { coursesService } from '@/features/admin/services/coursesService';
import courseService from '@/features/teacher/services/courseService';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface UpdateExamProps {
    exam: IExamResponse | any;
    onSuccess: () => void;
}

interface ExamFormData {
    title: string;
    description: string;
    course: string;
    lesson: string;
    solutionVideo: string;
    settings: {
        duration: number;
        passingScore: number;
        showResults: boolean;
        showCorrectAnswers: boolean;
        allowRetake: boolean;
        maxAttempts: number;
        shuffleQuestions: boolean;
        shuffleAnswers: boolean;
        requireAll: boolean;
        requiredBeforeNextLesson: boolean;
    };
}

export default function UpdateExam({ exam, onSuccess }: UpdateExamProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const { role } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string>(exam?.course?._id || '');

    const { register, handleSubmit, control, watch, reset } = useForm<ExamFormData>({
        defaultValues: {
            title: exam?.title || '',
            description: exam?.description || '',
            course: exam?.course?._id || '',
            lesson: exam?.lesson?._id || '',
            solutionVideo: exam?.solutionVideo || '',
            settings: {
                duration: exam?.settings?.duration || 0,
                passingScore: exam?.settings?.passingScore || 50,
                showResults: exam?.settings?.showResults ?? true,
                showCorrectAnswers: exam?.settings?.showCorrectAnswers ?? true,
                allowRetake: exam?.settings?.allowRetake ?? true,
                maxAttempts: exam?.settings?.maxAttempts || 0,
                shuffleQuestions: exam?.settings?.shuffleQuestions ?? false,
                shuffleAnswers: exam?.settings?.shuffleAnswers ?? false,
                requireAll: exam?.settings?.requireAll ?? true,
                requiredBeforeNextLesson: (exam as any)?.settings?.requiredBeforeNextLesson ?? false,
            },
        },
    });

    const watchedCourse = watch('course');

    useEffect(() => {
        if (exam) {
            reset({
                title: exam?.title || '',
                description: exam?.description || '',
                course: exam?.course?._id || '',
                lesson: exam?.lesson?._id || '',
                solutionVideo: exam?.solutionVideo || '',
                settings: {
                    duration: exam?.settings?.duration || 0,
                    passingScore: exam?.settings?.passingScore || 50,
                    showResults: exam?.settings?.showResults ?? true,
                    showCorrectAnswers: exam?.settings?.showCorrectAnswers ?? true,
                    allowRetake: exam?.settings?.allowRetake ?? true,
                    maxAttempts: exam?.settings?.maxAttempts || 0,
                    shuffleQuestions: exam?.settings?.shuffleQuestions ?? false,
                    shuffleAnswers: exam?.settings?.shuffleAnswers ?? false,
                    requireAll: exam?.settings?.requireAll ?? true,
                    requiredBeforeNextLesson: (exam as any)?.settings?.requiredBeforeNextLesson ?? false,
                },
            });
            setSelectedCourseId(exam?.course?._id || '');
        }
    }, [exam, reset]);

    useEffect(() => {
        if (watchedCourse && watchedCourse !== selectedCourseId) {
            setSelectedCourseId(watchedCourse);
            fetchLessons(watchedCourse);
        }
    }, [watchedCourse]);

    const fetchCourses = async () => {
        try {
            if (role === UserRole.ADMIN && exam?.teacher?._id) {
                await coursesService.getAllCourses({
                    page: 1,
                    limit: 1000,
                    teacher: exam.teacher._id,
                });
            } else {
                await courseService.getMyCourses({ limit: 100 });
            }
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchLessons = async (courseId: string) => {
        try {
            await courseService.getCourseLessons(courseId);
        } catch (error) {
            console.error('Failed to fetch lessons', error);
        }
    };

    const onSubmit = async (values: ExamFormData) => {
        try {
            setLoading(true);
            const updateData: IUpdateExamRequest = {
                title: values.title,
                description: values.description,
                solutionVideo: values.solutionVideo || undefined,
                settings: values.settings,
            };

            await examService.updateExam(exam._id, updateData);
            toast({
                title: 'نجح',
                description: 'تم تحديث بيانات الامتحان بنجاح',
                status: 'success',
            });
            onClose();
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في تحديث الامتحان',
                status: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                size="md"
                colorScheme="blue"
                fontWeight="medium"
                gap={2}
                borderRadius="lg"
                onClick={() => {
                    onOpen();
                    fetchCourses();
                    if (selectedCourseId) {
                        fetchLessons(selectedCourseId);
                    }
                }}
                leftIcon={<Icon icon="solar:pen-bold-duotone" width="18" height="18" />}
            >
                تعديل بيانات الامتحان
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
                <ModalContent borderRadius="xl" overflow="hidden">
                    <ModalHeader
                        bg="blue.50"
                        borderBottom="1px"
                        borderColor="gray.200"
                        p={5}
                    >
                        <HStack spacing={3}>
                            <Box
                                w={10}
                                h={10}
                                borderRadius="lg"
                                bg="blue.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon
                                    icon="solar:pen-bold-duotone"
                                    width="24"
                                    height="24"
                                    style={{ color: 'var(--chakra-colors-blue-600)' }}
                                />
                            </Box>
                            <Box fontSize="xl" fontWeight="bold" color="gray.800">
                                تعديل بيانات الامتحان
                            </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton size="lg" />
                    <ModalBody p={6} maxH="80vh" overflowY="auto">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <VStack spacing={5} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                        العنوان
                                    </FormLabel>
                                    <Textarea
                                        placeholder="أدخل عنوان الامتحان..."
                                        {...register('title', { required: 'العنوان مطلوب' })}
                                        maxLength={255}
                                        size="md"
                                        borderRadius="lg"
                                        border="1px"
                                        borderColor="gray.300"
                                        rows={2}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                        الوصف
                                    </FormLabel>
                                    <Textarea
                                        placeholder="وصف الامتحان (اختياري)"
                                        {...register('description')}
                                        size="md"
                                        borderRadius="lg"
                                        border="1px"
                                        borderColor="gray.300"
                                        rows={3}
                                    />
                                </FormControl>

                                <Divider />

                                <Stack spacing={3}>
                                    <Box fontSize="sm" fontWeight="bold" color="gray.700">
                                        إعدادات الامتحان
                                    </Box>

                                    <Box p={3} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                        <HStack justify="space-between" align="center">
                                            <HStack spacing={3}>
                                                <Icon icon="solar:check-circle-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                                <FormLabel m={0} fontSize="sm" fontWeight="medium" color="gray.700">
                                                    عرض السؤال الصحيح
                                                </FormLabel>
                                            </HStack>
                                            <Controller
                                                name="settings.showCorrectAnswers"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        isChecked={field.value}
                                                        onChange={field.onChange}
                                                        colorScheme="blue"
                                                        size="md"
                                                    />
                                                )}
                                            />
                                        </HStack>
                                    </Box>

                                    <Box p={3} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                        <HStack justify="space-between" align="center">
                                            <HStack spacing={3}>
                                                <Icon icon="solar:document-text-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                                <FormLabel m={0} fontSize="sm" fontWeight="medium" color="gray.700">
                                                    عرض نتيجة الامتحان
                                                </FormLabel>
                                            </HStack>
                                            <Controller
                                                name="settings.showResults"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        isChecked={field.value}
                                                        onChange={field.onChange}
                                                        colorScheme="blue"
                                                        size="md"
                                                    />
                                                )}
                                            />
                                        </HStack>
                                    </Box>

                                    <Box p={3} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                        <HStack justify="space-between" align="center">
                                            <HStack spacing={3}>
                                                <Icon icon="solar:lock-password-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                                <FormLabel m={0} fontSize="sm" fontWeight="medium" color="gray.700">
                                                    اجباري قبل الدرس التالي
                                                </FormLabel>
                                            </HStack>
                                            <Controller
                                                name="settings.requiredBeforeNextLesson"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        isChecked={field.value}
                                                        onChange={field.onChange}
                                                        colorScheme="blue"
                                                        size="md"
                                                    />
                                                )}
                                            />
                                        </HStack>
                                    </Box>

                                    <Box p={3} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                                        <HStack justify="space-between" align="center">
                                            <HStack spacing={3}>
                                                <Icon icon="solar:clock-circle-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                                <FormLabel m={0} fontSize="sm" fontWeight="medium" color="gray.700">
                                                    اضافة وقت الامتحان
                                                </FormLabel>
                                            </HStack>
                                            <Controller
                                                name="settings.duration"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        isChecked={(field.value || 0) > 0}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.checked ? 60 : 0);
                                                        }}
                                                        colorScheme="blue"
                                                        size="md"
                                                    />
                                                )}
                                            />
                                        </HStack>
                                    </Box>

                                    {watch('settings.duration') > 0 && (
                                        <Controller
                                            name="settings.duration"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl>
                                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                                        مدة الامتحان (بالدقائق)
                                                    </FormLabel>
                                                    <NumberInput
                                                        value={field.value}
                                                        onChange={(_, val) => field.onChange(val)}
                                                        min={1}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                            )}
                                        />
                                    )}
                                </Stack>

                                <Divider />

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                        رابط فيديو حل الامتحان
                                    </FormLabel>
                                    <Input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=example"
                                        {...register('solutionVideo')}
                                        size="md"
                                        borderRadius="lg"
                                        border="1px"
                                        borderColor="gray.300"
                                    />
                                </FormControl>
                            </VStack>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="outline" onClick={onClose} size="md" borderRadius="lg" mr={3}>
                            إلغاء
                        </Button>
                        <Button
                            colorScheme="blue"
                            size="md"
                            borderRadius="lg"
                            onClick={handleSubmit(onSubmit)}
                            isLoading={loading}
                            leftIcon={<Icon icon="solar:check-circle-bold-duotone" width="18" height="18" />}
                        >
                            حفظ التعديلات
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
