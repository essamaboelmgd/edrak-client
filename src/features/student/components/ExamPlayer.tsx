import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStartExam, useSubmitAnswer, useSubmitExam } from '@/features/student/hooks/useStudentExams';
import { Box, Button, Container, Flex, Heading, Text, Radio, RadioGroup, Stack, Progress, useToast, Spinner } from '@chakra-ui/react';
import { Timer } from 'lucide-react';

const ExamPlayer = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    
    // Mutations
    const { mutate: startExam, isPending: isStarting } = useStartExam();
    const { mutate: submitAnswer } = useSubmitAnswer();
    const { mutate: submitExam, isPending: isSubmitting } = useSubmitExam();

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);

    // Start Exam on Mount
    useEffect(() => {
        if (examId && !attemptId && !isStarting) {
            startExam(examId, {
                onSuccess: (data) => {
                    setAttemptId(data.attempt._id);
                    setQuestions(data.questions || []); 
                    // Calculate time left based on attempt start time + duration (if backend provides it)
                    // For now assuming duration is passed or we just count down
                    // Ideally backend gives 'endTime'
                    if (data.attempt.endTime) {
                         const end = new Date(data.attempt.endTime).getTime();
                         const now = new Date().getTime();
                         setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
                    } else {
                        // Fallback logic if needed
                    }
                },
                onError: (error: any) => {
                    toast({
                        title: 'خطأ في بدء الاختبار',
                        description: error.response?.data?.message || 'لا يمكن بدء الاختبار حالياً',
                        status: 'error',
                    });
                    navigate('/student/exams');
                }
            });
        }
    }, [examId]);

    // Timer Tick
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleAnswerChange = (value: string) => {
        const currentQuestion = questions[currentQuestionIndex];
        setAnswers({ ...answers, [currentQuestion._id]: value });
        
        if (attemptId) {
            submitAnswer({
                attemptId,
                questionId: currentQuestion._id,
                answer: { selectedOptions: [value] } // Assuming MCQ for simplicity
            });
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitExam = () => {
        if (!attemptId) return;
        submitExam(attemptId, {
            onSuccess: () => {
                toast({
                    title: 'تم تسليم الاختبار',
                    status: 'success',
                });
                navigate(`/student/exams/${examId}/results`);
            }
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isStarting || !questions.length) {
        return (
            <Flex h="50vh" justify="center" align="center" direction="column" gap={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>جاري تجهيز الاختبار...</Text>
            </Flex>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <Container maxW="container.lg" py={8}>
            {/* Header / Timer */}
            <Flex justify="space-between" align="center" mb={6} bg="white" p={4} borderRadius="xl" shadow="sm">
                <Heading size="md">السؤال {currentQuestionIndex + 1} من {questions.length}</Heading>
                {timeLeft !== null && (
                    <Flex align="center" gap={2} color={timeLeft < 60 ? 'red.500' : 'blue.600'} fontWeight="bold">
                        <Timer size={20} />
                        <Text fontSize="xl" fontFamily="monospace">{formatTime(timeLeft)}</Text>
                    </Flex>
                )}
            </Flex>

            {/* Progress Bar */}
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} mb={8} borderRadius="full" size="sm" colorScheme="blue" />

            {/* Question Card */}
            <Box bg="white" p={8} borderRadius="2xl" shadow="md" mb={8}>
                <Text fontSize="lg" fontWeight="medium" mb={6}>{currentQuestion.text}</Text>
                
                <RadioGroup onChange={handleAnswerChange} value={answers[currentQuestion._id]}>
                    <Stack spacing={4}>
                        {currentQuestion.options?.map((opt: any) => (
                            <Radio key={opt._id} value={opt._id} size="lg" colorScheme="blue">
                                <Box ml={3}>{opt.text}</Box>
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
            </Box>

            {/* Navigation Buttons */}
            <Flex justify="space-between">
                <Button onClick={handlePrev} isDisabled={currentQuestionIndex === 0} variant="ghost">Since السابق</Button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                    <Button colorScheme="green" onClick={handleSubmitExam} isLoading={isSubmitting}>تسليم الاختبار</Button>
                ) : (
                    <Button colorScheme="blue" onClick={handleNext}>التالي</Button>
                )}
            </Flex>
        </Container>
    );
};

export default ExamPlayer;
