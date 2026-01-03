
import {
    Box,
    Button,
    Card,
    CardBody,
    Center,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Progress,
    Radio,
    RadioGroup,
    SimpleGrid,
    Stack,
    Text,
    useToast,
    VStack,
    Badge,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, CheckCircle } from "lucide-react";
import { examService } from "@/features/student/services/examService";
import Countdown from "react-countdown";

export default function ExamPage() {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Fetch/Start Exam
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["startExam", examId],
        queryFn: () => examService.startExam(examId!),
        enabled: !!examId,
        retry: false,
        staleTime: Infinity, // Don't re-fetch on focus
    });

    const attempt = data?.attempt;
    const questions = data?.exam?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    // Initialize answers from existing attempt (if resuming)
    useQuery({
        queryKey: ["initAnswers", attempt?._id],
        queryFn: () => {
            if (attempt?.answers && Array.isArray(attempt.answers)) {
                const initialAnswers: Record<string, string> = {};
                attempt.answers.forEach((ans: any) => {
                    if (ans.selectedAnswers?.[0]) {
                        initialAnswers[ans.question] = ans.selectedAnswers[0];
                    }
                });
                setAnswers(initialAnswers);
            }
            return null;
        },
        enabled: !!attempt?.answers,
        retry: false
    });

    // Handle Answer Selection
    const handleAnswerChange = (value: string) => {
        if (!currentQuestion) return;
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.question._id]: value, // Assuming question object has _id
        }));
    };

    // Submit Exam
    const handleSubmit = async () => {
        if (!attempt?._id) return;
        setIsSubmitting(true);
        try {
            // First submit all answers
            const submissionPromises = Object.entries(answers).map(([qId, ans]) => 
                examService.submitAnswer(attempt._id, qId, { selectedAnswers: [ans] })
            );
            await Promise.all(submissionPromises);

            // Then finalize
            const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
                questionId: qId,
                selectedAnswers: [ans],
                // Add logic for written answer if supported later
            }));

            await examService.submitExam(attempt._id, { answers: formattedAnswers });

            toast({
                title: "تم الانتهاء من الامتحان بنجاح",
                status: "success",
            });
            navigate(`/student/exams/${examId}/results`, { replace: true });
        } catch (err: any) {
            toast({
                title: "خطأ في تسليم الامتحان",
                description: err.response?.data?.message || err.message,
                status: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTimerComplete = () => {
        toast({
            title: "انتهى وقت الامتحان",
            description: "سيتم تسليم إجاباتك تلقائياً",
            status: "warning",
            duration: 5000,
        });
        handleSubmit();
    };

    if (isLoading) {
        return (
            <Center h="50vh">
                <VStack>
                    <Spinner size="xl" color="blue.500" />
                    <Text>جاري تجهيز الامتحان...</Text>
                </VStack>
            </Center>
        );
    }

    if (isError) {
        return (
            <Center h="50vh">
                <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" maxW="lg" borderRadius="md">
                    <AlertIcon boxSize="40px" mr={0} />
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                        خطأ في تحميل الامتحان
                    </AlertTitle>
                    <AlertDescription maxWidth="sm">
                        {(error as any)?.response?.data?.message || "حدث خطأ غير متوقع. قد لا يكون الامتحان متاحاً حالياً أو انتهى وقته."}
                    </AlertDescription>
                    <Button mt={4} colorScheme="red" onClick={() => navigate(-1)}>
                        عودة
                    </Button>
                </Alert>
            </Center>
        );
    }

    // Timer setup
    // Using simple duration from settings or date math if exam has specific end time
    // Assuming attempt has startTime and exam has duration
    // If not provided in attempt, fallback to exam settings
    const durationMinutes = data?.exam?.settings?.duration || 0;
    
    // Calculate end time based on attempt start time
    const startTime = attempt?.startedAt ? new Date(attempt.startedAt).getTime() : Date.now();
    const endTime = startTime + durationMinutes * 60 * 1000;
    
    // NOTE: In a real robust app, syncing server time is crucial.
    const renderer = ({ hours, minutes, seconds, completed }: any) => {
        if (completed) {
            return <Text color="red.500" fontWeight="bold">00:00:00</Text>;
        }
        return (
            <HStack spacing={1} color={minutes < 5 ? "red.500" : "blue.600"} fontWeight="bold" fontSize="xl">
                <Icon as={Clock} />
                <Text>
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
            </HStack>
        );
    };

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <Container maxW="container.xl" py={8}>
            <Stack spacing={6}>
                {/* Header */}
                <Card>
                    <CardBody>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                            <VStack align="start" spacing={1}>
                                <Heading size="md" color="blue.600">{data?.exam?.title}</Heading>
                                <Text color="gray.500" fontSize="sm">عدد الأسئلة: {questions.length}</Text>
                            </VStack>

                            {durationMinutes > 0 && (
                                <Box p={3} bg="blue.50" borderRadius="md">
                                    <Countdown
                                        date={endTime} 
                                        renderer={renderer}
                                        onComplete={handleTimerComplete}
                                    />
                                </Box>
                            )}
                        </Flex>
                    </CardBody>
                </Card>

                {/* Progress Bar */}
                <Box>
                    <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">السؤال {currentQuestionIndex + 1} من {questions.length}</Text>
                        <Text fontSize="sm" color="gray.600">{Math.round(progress)}% مكتمل</Text>
                    </Flex>
                    <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
                </Box>

                {/* Question Area */}
                <Flex gap={6} direction={{ base: "column", lg: "row" }}>
                    <Box flex={1}>
                        <Card minH="400px">
                            <CardBody>
                                {questions.length === 0 ? (
                                    <Center h="200px">
                                        <Text color="gray.500">لا توجد أسئلة في هذا الامتحان</Text>
                                    </Center>
                                ) : currentQuestion && (
                                    <Stack spacing={6}>
                                        <Flex justify="space-between" align="start">
                                            <VStack align="start" spacing={2} w="full">
                                                <Heading size="sm" color="gray.700">السؤال {currentQuestionIndex + 1}</Heading>
                                                <Text fontSize="lg" fontWeight="medium" dangerouslySetInnerHTML={{ __html: currentQuestion.question.question }} />
                                            </VStack>
                                            <Badge colorScheme="purple" flexShrink={0}>{currentQuestion.points} درجات</Badge>
                                        </Flex>

                                        <RadioGroup
                                            onChange={handleAnswerChange}
                                            value={answers[currentQuestion.question._id] || ""}
                                        >
                                            <Stack spacing={4}>
                                                {currentQuestion.question.answers?.map((answer: any, idx: number) => (
                                                    <Box
                                                        key={idx}
                                                        borderWidth="1px"
                                                        borderRadius="md"
                                                        p={4}
                                                        _hover={{ bg: "gray.50", borderColor: "blue.400" }}
                                                        borderColor={answers[currentQuestion.question._id] === (answer._id || answer.text) ? "blue.500" : "gray.200"}
                                                        bg={answers[currentQuestion.question._id] === (answer._id || answer.text) ? "blue.50" : "white"}
                                                        cursor="pointer"
                                                        onClick={() => handleAnswerChange(answer._id || answer.text)}
                                                    >
                                                        <Radio value={answer._id || answer.text} width="100%">
                                                            <Text ms={2}>{answer.text}</Text>
                                                        </Radio>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </RadioGroup>
                                    </Stack>
                                )}
                            </CardBody>
                        </Card>

                        {/* Navigation Buttons */}
                        <Flex justify="space-between" mt={6}>
                            <Button
                                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                                isDisabled={currentQuestionIndex === 0}
                                variant="outline"
                            >
                                السؤال السابق
                            </Button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                    colorScheme="blue"
                                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                                >
                                    السؤال التالي
                                </Button>
                            ) : (
                                <Button
                                    colorScheme="green"
                                    leftIcon={<Icon as={CheckCircle} />}
                                    onClick={handleSubmit}
                                    isLoading={isSubmitting}
                                >
                                    تسليم الامتحان
                                </Button>
                            )}
                        </Flex>
                    </Box>

                    {/* Question Map */}
                    <Box w={{ base: "100%", lg: "300px" }}>
                        <Card position="sticky" top="4">
                            <CardBody>
                                <Heading size="sm" mb={4}>خريطة الأسئلة</Heading>
                                <SimpleGrid columns={5} gap={2}>
                                    {questions.map((q: any, idx: number) => (
                                        <Button
                                            key={q.question._id}
                                            size="sm"
                                            variant={idx === currentQuestionIndex ? "solid" : "outline"}
                                            colorScheme={answers[q.question._id] ? "green" : (idx === currentQuestionIndex ? "blue" : "gray")}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                        >
                                            {idx + 1}
                                        </Button>
                                    ))}
                                </SimpleGrid>
                                <Stack mt={6} spacing={2} fontSize="sm" color="gray.500">
                                    <HStack><Box w={3} h={3} bg="green.500" borderRadius="full" /><Text>محلول</Text></HStack>
                                    <HStack><Box w={3} h={3} bg="blue.500" borderRadius="full" /><Text>الحالي</Text></HStack>
                                    <HStack><Box w={3} h={3} border="1px solid gray" borderRadius="full" /><Text>غير محلول</Text></HStack>
                                </Stack>
                            </CardBody>
                        </Card>
                    </Box>
                </Flex>
            </Stack>
        </Container>
    );
}

