import { useState } from 'react';
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
    Radio,
    RadioGroup,
    Image,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { useForm, Controller } from 'react-hook-form';
import examService from '@/features/exams/examService';

interface AddQuestionProps {
    examId: string;
    onSuccess: () => void;
    questionCount?: number;
}

const arabicNumbers = [
    'السؤال الأول',
    'السؤال الثاني',
    'السؤال الثالث',
    'السؤال الرابع',
    'السؤال الخامس',
    'السؤال السادس',
    'السؤال السابع',
    'السؤال الثامن',
    'السؤال التاسع',
    'السؤال العاشر',
];

interface QuestionFormData {
    question: string;
    questionType: 'mcq' | 'true_false';
    answers: Array<{ text: string; isCorrect: boolean; order: number }>;
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    explanation: string;
}

export default function AddQuestion({ examId, onSuccess, questionCount = 0 }: AddQuestionProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { register, handleSubmit, control, watch, setValue, reset } = useForm<QuestionFormData>({
        defaultValues: {
            question: questionCount < arabicNumbers.length ? arabicNumbers[questionCount] : `السؤال ${questionCount + 1}`,
            questionType: 'mcq',
            answers: [
                { text: '', isCorrect: false, order: 1 },
                { text: '', isCorrect: false, order: 2 },
                { text: '', isCorrect: false, order: 3 },
                { text: '', isCorrect: false, order: 4 },
            ],
            correctAnswer: '',
            difficulty: 'medium',
            points: 1,
            explanation: '',
        },
    });

    const questionType = watch('questionType');
    const answers = watch('answers');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
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
    };

    const onSubmit = async (values: QuestionFormData) => {
        try {
            setLoading(true);

            // Get exam to find the teacher
            const examResponse = await examService.getExamById(examId, false);
            const exam = examResponse.data.exam;
            const examTeacherId = typeof exam.teacher === 'string'
                ? exam.teacher
                : exam.teacher?._id;

            // Create FormData to include image if provided
            const formData = new FormData();

            // Add question data as JSON string (for nested objects)
            formData.append('question', values.question);
            formData.append('questionType', values.questionType);
            formData.append('answers', JSON.stringify(values.questionType === 'mcq' ? values.answers : [
                { text: 'صحيح', isCorrect: true, order: 1 },
                { text: 'خطأ', isCorrect: false, order: 2 },
            ]));
            formData.append('correctAnswer', values.correctAnswer || (values.questionType === 'true_false' ? 'صحيح' : ''));
            formData.append('difficulty', values.difficulty);
            formData.append('points', values.points.toString());
            if (values.explanation) {
                formData.append('explanation', values.explanation);
            }
            formData.append('isGeneral', 'true');
            if (examTeacherId) {
                formData.append('teacher', examTeacherId);
            }

            // Add image if provided
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const questionResponse = await examService.createQuestion(formData);
            const questionId = questionResponse.data.question._id;

            // Then add it to the exam
            await examService.addQuestionToExam(examId, {
                questionId,
                points: values.points,
                order: questionCount + 1,
            });

            toast({
                title: 'نجح',
                description: 'تم إضافة السؤال بنجاح',
                status: 'success',
            });
            onClose();
            reset();
            setImageFile(null);
            setImagePreview(null);
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'فشل في إضافة السؤال',
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
                colorScheme="green"
                borderRadius="lg"
                onClick={onOpen}
                gap={2}
                fontWeight="medium"
                leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="18" height="18" />}
            >
                اضافة سؤال جديد
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
                <ModalContent borderRadius="xl" overflow="hidden">
                    <ModalHeader
                        bg="green.50"
                        borderBottom="1px"
                        borderColor="gray.200"
                        p={5}
                    >
                        <HStack spacing={3}>
                            <Box
                                w={10}
                                h={10}
                                borderRadius="lg"
                                bg="green.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon
                                    icon="solar:add-circle-bold-duotone"
                                    width="24"
                                    height="24"
                                    style={{ color: 'var(--chakra-colors-green-600)' }}
                                />
                            </Box>
                            <Box fontSize="xl" fontWeight="bold" color="gray.800">
                                اضافة سؤال جديد
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
                                        placeholder="أدخل عنوان السؤال..."
                                        {...register('question', { required: 'العنوان مطلوب' })}
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
                                        صورة السؤال (اختياري)
                                    </FormLabel>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        display="none"
                                        id="question-image-input"
                                    />
                                    <HStack spacing={2}>
                                        <Button
                                            as="label"
                                            htmlFor="question-image-input"
                                            size="sm"
                                            leftIcon={<Icon icon="solar:gallery-bold-duotone" width="16" height="16" />}
                                            cursor="pointer"
                                        >
                                            اختر صورة
                                        </Button>
                                        {imagePreview && (
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                }}
                                            >
                                                إزالة
                                            </Button>
                                        )}
                                    </HStack>
                                    {imagePreview && (
                                        <Box mt={2}>
                                            <Image src={imagePreview} alt="Preview" maxH="200px" borderRadius="md" />
                                        </Box>
                                    )}
                                </FormControl>

                                <HStack>
                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                            نوع السؤال
                                        </FormLabel>
                                        <Controller
                                            name="questionType"
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onChange={(val) => {
                                                        field.onChange(val);
                                                        if (val === 'true_false') {
                                                            setValue('answers', [
                                                                { text: 'صحيح', isCorrect: true, order: 1 },
                                                                { text: 'خطأ', isCorrect: false, order: 2 },
                                                            ]);
                                                            setValue('correctAnswer', 'صحيح');
                                                        } else if (val === 'mcq') {
                                                            // Reset to default MCQ answers
                                                            setValue('answers', [
                                                                { text: '', isCorrect: false, order: 1 },
                                                                { text: '', isCorrect: false, order: 2 },
                                                                { text: '', isCorrect: false, order: 3 },
                                                                { text: '', isCorrect: false, order: 4 },
                                                            ]);
                                                            setValue('correctAnswer', '');
                                                        }
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={4}>
                                                        <Radio value="mcq" colorScheme="blue">اختيار من متعدد (MCQ)</Radio>
                                                        <Radio value="true_false" colorScheme="green">صحيح/خطأ (True/False)</Radio>
                                                    </Stack>
                                                </RadioGroup>
                                            )}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                            درجة السؤال
                                        </FormLabel>
                                        <Controller
                                            name="points"
                                            control={control}
                                            render={({ field }) => (
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
                                            )}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                            الصعوبة
                                        </FormLabel>
                                        <Controller
                                            name="difficulty"
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    <Stack direction="row">
                                                        <Radio value="easy">سهل</Radio>
                                                        <Radio value="medium">متوسط</Radio>
                                                        <Radio value="hard">صعب</Radio>
                                                    </Stack>
                                                </RadioGroup>
                                            )}
                                        />
                                    </FormControl>
                                </HStack>

                                <Divider />

                                {questionType === 'mcq' && (
                                    <Stack spacing={3}>
                                        <HStack spacing={2}>
                                            <Icon icon="solar:list-check-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                            <Box fontWeight="bold" fontSize="sm" color="gray.700">
                                                الإجابات
                                            </Box>
                                        </HStack>

                                        {answers.map((answer, idx) => {
                                            const letter = String.fromCharCode(65 + idx);
                                            return (
                                                <Box
                                                    key={idx}
                                                    p={4}
                                                    border="2px"
                                                    borderColor={answer.isCorrect ? 'green.400' : 'gray.200'}
                                                    bg={answer.isCorrect ? 'green.50' : 'white'}
                                                    borderRadius="lg"
                                                >
                                                    <HStack spacing={3}>
                                                        <Box
                                                            w={8}
                                                            h={8}
                                                            borderRadius="md"
                                                            bg={answer.isCorrect ? 'green.500' : 'gray.200'}
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            flexShrink={0}
                                                        >
                                                            <Box fontSize="sm" fontWeight="bold" color={answer.isCorrect ? 'white' : 'gray.600'}>
                                                                {letter}
                                                            </Box>
                                                        </Box>
                                                        <Radio
                                                            isChecked={answer.isCorrect}
                                                            onChange={(e) => {
                                                                const newAnswers = answers.map((a, i) => ({
                                                                    ...a,
                                                                    isCorrect: i === idx ? e.target.checked : false,
                                                                }));
                                                                setValue('answers', newAnswers);
                                                                setValue('correctAnswer', e.target.checked ? answer.text : '');
                                                            }}
                                                            colorScheme="green"
                                                            size="lg"
                                                        />
                                                        <Input
                                                            type="text"
                                                            placeholder={`أدخل الإجابة ${letter}...`}
                                                            value={answer.text}
                                                            onChange={(e) => {
                                                                const newAnswers = [...answers];
                                                                newAnswers[idx].text = e.target.value;
                                                                setValue('answers', newAnswers);
                                                                if (answer.isCorrect) {
                                                                    setValue('correctAnswer', e.target.value);
                                                                }
                                                            }}
                                                            required
                                                            maxLength={255}
                                                            size="md"
                                                            borderRadius="lg"
                                                            border="1px"
                                                            borderColor="gray.300"
                                                            flex={1}
                                                        />
                                                    </HStack>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}

                                {questionType === 'true_false' && (
                                    <Stack spacing={3}>
                                        <HStack spacing={2}>
                                            <Icon icon="solar:check-circle-bold-duotone" width="20" height="20" style={{ color: 'var(--chakra-colors-gray-600)' }} />
                                            <Box fontWeight="bold" fontSize="sm" color="gray.700">
                                                الإجابات (صحيح/خطأ)
                                            </Box>
                                        </HStack>

                                        {answers.slice(0, 2).map((answer, idx) => {
                                            const isCorrect = answer.isCorrect;
                                            return (
                                                <Box
                                                    key={idx}
                                                    p={4}
                                                    border="2px"
                                                    borderColor={isCorrect ? 'green.400' : 'gray.200'}
                                                    bg={isCorrect ? 'green.50' : 'white'}
                                                    borderRadius="lg"
                                                    cursor="pointer"
                                                    onClick={() => {
                                                        const newAnswers = [
                                                            { text: 'صحيح', isCorrect: idx === 0, order: 1 },
                                                            { text: 'خطأ', isCorrect: idx === 1, order: 2 },
                                                        ];
                                                        setValue('answers', newAnswers);
                                                        setValue('correctAnswer', idx === 0 ? 'صحيح' : 'خطأ');
                                                    }}
                                                    _hover={{
                                                        borderColor: isCorrect ? 'green.500' : 'gray.300',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 'md',
                                                    }}
                                                    transition="all 0.2s"
                                                >
                                                    <HStack spacing={3}>
                                                        <Box
                                                            w={8}
                                                            h={8}
                                                            borderRadius="md"
                                                            bg={isCorrect ? 'green.500' : 'gray.200'}
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            flexShrink={0}
                                                        >
                                                            <Icon
                                                                icon={isCorrect ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                                                                width="20"
                                                                height="20"
                                                                style={{ color: isCorrect ? 'white' : 'gray.600' }}
                                                            />
                                                        </Box>
                                                        <Radio
                                                            isChecked={isCorrect}
                                                            onChange={(e) => {
                                                                const newAnswers = [
                                                                    { text: 'صحيح', isCorrect: idx === 0 && e.target.checked, order: 1 },
                                                                    { text: 'خطأ', isCorrect: idx === 1 && e.target.checked, order: 2 },
                                                                ];
                                                                setValue('answers', newAnswers);
                                                                setValue('correctAnswer', e.target.checked ? answer.text : '');
                                                            }}
                                                            colorScheme="green"
                                                            size="lg"
                                                        />
                                                        <Input
                                                            type="text"
                                                            value={answer.text}
                                                            onChange={(e) => {
                                                                const newAnswers = [...answers];
                                                                newAnswers[idx].text = e.target.value;
                                                                setValue('answers', newAnswers);
                                                                if (answer.isCorrect) {
                                                                    setValue('correctAnswer', e.target.value);
                                                                }
                                                            }}
                                                            required
                                                            maxLength={255}
                                                            size="md"
                                                            borderRadius="lg"
                                                            border="1px"
                                                            borderColor="gray.300"
                                                            flex={1}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </HStack>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                        الشرح (اختياري)
                                    </FormLabel>
                                    <Textarea
                                        placeholder="شرح السؤال..."
                                        {...register('explanation')}
                                        size="md"
                                        borderRadius="lg"
                                        border="1px"
                                        borderColor="gray.300"
                                        rows={2}
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
                            colorScheme="green"
                            size="md"
                            borderRadius="lg"
                            onClick={handleSubmit(onSubmit)}
                            isLoading={loading}
                            leftIcon={<Icon icon="solar:check-circle-bold-duotone" width="18" height="18" />}
                        >
                            حفظ السؤال
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
