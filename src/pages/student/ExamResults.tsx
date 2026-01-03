import {
    Box,
    Button,
    Card,
    CardBody,
    Center,
    CircularProgress,
    CircularProgressLabel,
    Container,
    Heading,
    HStack,
    Icon,
    Radio,
    SimpleGrid,
    Spacer,
    Spinner,
    Stack,
    Text,
    useColorModeValue,
    VStack,
    Wrap,
    WrapItem,
    Badge,
    Link as ChakraLink
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PlayCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { examService } from "@/features/student/services/examService";

export default function ExamResults() {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    // 1. Fetch Overall Results Summary to get Best/Latest Attempt
    const { data: resultsData, isLoading: isLoadingResults } = useQuery({
        queryKey: ["examResults", examId],
        queryFn: () => examService.getExamResults(examId!),
        enabled: !!examId
    });

    // 2. Determine which attempt to show (Best Attempt)
    const bestAttempt = resultsData?.bestAttempt;
    const attemptId = resultsData?.attempts?.find((a: any) => a.attemptNumber === bestAttempt?.attemptNumber)?._id;

    // 3. Fetch Detailed Attempt Data
    const { data: attemptDetail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ["attemptDetail", attemptId],
        queryFn: () => examService.getAttemptDetails(attemptId),
        enabled: !!attemptId,
        retry: false
    });

    const isLoading = isLoadingResults || (!!attemptId && isLoadingDetail);

    // Dynamic Colors
    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.300");

    if (isLoading) {
        return (
            <Center h="50vh" flexDirection="column" gap={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>جاري تحميل النتائج...</Text>
            </Center>
        );
    }

    if (!resultsData || (!attemptId && !isLoadingResults)) {
        return (
             <Center h="50vh" flexDirection="column" gap={4}>
                <Icon as={AlertTriangle} boxSize={12} color="orange.500" />
                <Text fontSize="lg" fontWeight="bold">لم يتم العثور على نتائج</Text>
                <Button colorScheme="blue" onClick={() => navigate("/student/courses")}>
                    العودة للكورسات
                </Button>
            </Center>
        );
    }

    // Access control check (legacy feature)
    // If showResults setting is false, we might want to hide details
    const showResults = attemptDetail?.exam?.settings?.showResults ?? true;
    
    // Legacy page access denied UI
    if (!showResults) {
        return (
            <Container maxW="container.lg" py={8}>
                 <Card bg={cardBg}>
                    <CardBody py={10}>
                         <Center flexDirection="column" gap={6} textAlign="center">
                            <Icon as={AlertTriangle} boxSize={16} color="red.500" />
                            <Heading size="lg" color="red.500">الوصول مرفوض</Heading>
                            <Text fontSize="lg">عذرًا، لا يُسمح بعرض نتائج هذا الامتحان.</Text>
                            <Button colorScheme="blue" onClick={() => navigate(-1)}>
                                العودة
                            </Button>
                         </Center>
                    </CardBody>
                 </Card>
            </Container>
        );
    }

    const examTitle = attemptDetail?.exam?.title || "نتيجة الامتحان";
    const totalScore = attemptDetail?.exam?.totalPoints || 0;
    const studentScore = attemptDetail?.score || 0;
    const percentage = attemptDetail?.percentage || 0;
    const questions = attemptDetail?.answers || []; // answers array contains populated question data
    
    // Stats
    const correctCount = questions.filter((a: any) => a.isCorrect).length;
    const incorrectCount = questions.length - correctCount;

    return (
        <Container maxW="container.lg" py={8}>
            <Stack spacing={6}>
                {/* Header Link */}
                <HStack>
                    <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate(-1)}>
                        العودة
                    </Button>
                    <Heading size="md">{examTitle}</Heading>
                </HStack>

                {/* Main Score Card */}
                <Card bg={cardBg}>
                    <CardBody>
                        <Center flexDirection="column" gap={4}>
                            <CircularProgress
                                value={percentage}
                                color={percentage >= 50 ? "green.400" : "red.400"}
                                size="120px"
                                thickness="8px"
                            >
                                <CircularProgressLabel fontSize="xl" fontWeight="bold">
                                    {studentScore} / {totalScore}
                                </CircularProgressLabel>
                            </CircularProgress>
                            <Text fontSize="lg" fontWeight="bold">نتيجة الامتحان</Text>
                        </Center>
                    </CardBody>
                </Card>

                {/* Stats Cards */}
                <Wrap spacing={4} justify="center">
                    <WrapItem>
                        <Card bg="purple.500" color="white" minW="200px">
                            <CardBody textAlign="center">
                                <Text fontSize="lg" mb={2}>عدد الأسئلة</Text>
                                <Heading size="lg">{questions.length}</Heading>
                            </CardBody>
                        </Card>
                    </WrapItem>
                    <WrapItem>
                         <Card bg="blue.500" color="white" minW="200px">
                            <CardBody textAlign="center">
                                <Text fontSize="lg" mb={2}>إجابات صحيحة</Text>
                                <Heading size="lg">{correctCount}</Heading>
                            </CardBody>
                        </Card>
                    </WrapItem>
                    <WrapItem>
                         <Card bg="red.500" color="white" minW="200px">
                            <CardBody textAlign="center">
                                <Text fontSize="lg" mb={2}>إجابات خاطئة</Text>
                                <Heading size="lg">{incorrectCount}</Heading>
                            </CardBody>
                        </Card>
                    </WrapItem>
                </Wrap>

                {/* Solution Video */}
                {attemptDetail?.exam?.solutionVideo && (
                    <Card bg={cardBg}>
                        <CardBody>
                           <Stack spacing={4} align="center">
                                <Heading size="md" color="green.600">
                                    <Icon as={PlayCircle} mr={2} verticalAlign="middle" />
                                    فيديو حل الامتحان
                                </Heading>
                                <Button
                                    as={ChakraLink}
                                    href={attemptDetail.exam.solutionVideo}
                                    isExternal
                                    colorScheme="green"
                                    size="lg"
                                    leftIcon={<PlayCircle />}
                                 >
                                    مشاهدة فيديو الحل
                                 </Button>
                           </Stack>
                        </CardBody>
                    </Card>
                )}

                {/* Questions Review */}
                <Stack spacing={4}>
                    {questions.map((ans: any, idx: number) => (
                        <Card key={idx} bg={cardBg} overflow="hidden">
                            <CardBody>
                                <Stack spacing={4}>
                                    {/* Question Header */}
                                    <HStack justify="space-between" align="start">
                                        <Heading size="sm" lineHeight="tall">
                                             <span dangerouslySetInnerHTML={{ __html: ans.question.question }} />
                                        </Heading>
                                        <Badge colorScheme={ans.isCorrect ? "green" : "red"} fontSize="md" p={1} borderRadius="md">
                                            {ans.pointsEarned} / {ans.question.points || 0}
                                        </Badge>
                                    </HStack>
                                    
                                    {/* Question Image/Description if any - omitted for now as legacy code was vague on this */}

                                    {/* Options Grid */}
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                                        {ans.question.answers?.map((option: any) => {
                                            const isSelected = ans.selectedAnswers?.includes(option._id) || ans.selectedAnswers?.includes(option.text);
                                            const isCorrectOption = option.isCorrect;
                                            
                                            // Determine styles based on state
                                            let optionBg = "gray.50";
                                            let optionBorder = "gray.200";
                                            let icon = null;
                                            
                                            // Logic mapping from legacy DisplayAnswerDetails
                                            // - If selected and correct -> Green bg, Green border
                                            // - If selected and wrong -> Red bg, Red border
                                            // - If correct (but not selected) -> Green text/border usually, but legacy highlights purely based on selection and correctness
                                            
                                            if (isSelected && isCorrectOption) {
                                                optionBg = "green.50";
                                                optionBorder = "green.500";
                                                icon = <CheckCircle color="green" size={16} />;
                                            } else if (isSelected && !isCorrectOption) {
                                                optionBg = "red.50";
                                                optionBorder = "red.500";
                                                icon = <XCircle color="red" size={16} />;
                                            } else if (isCorrectOption) {
                                                // Correct option not selected
                                                optionBorder = "green.500";
                                                // Legacy puts simple green border/text
                                            }

                                            return (
                                                <Box 
                                                    key={option._id}
                                                    p={3}
                                                    borderWidth="2px"
                                                    borderRadius="md"
                                                    bg={optionBg}
                                                    borderColor={optionBorder}
                                                    position="relative"
                                                >
                                                    <HStack justify="space-between">
                                                        <HStack>
                                                            <Radio 
                                                                isChecked={isSelected} 
                                                                isReadOnly 
                                                                colorScheme={isCorrectOption ? "green" : "red"}
                                                            />
                                                            <Text fontWeight={isSelected ? "bold" : "normal"}>
                                                                {option.text}
                                                            </Text>
                                                        </HStack>
                                                        {icon}
                                                    </HStack>
                                                    
                                                    {isCorrectOption && (
                                                         <Badge position="absolute" top="-10px" left="10px" colorScheme="green" variant="solid" borderRadius="full">
                                                            الإجابة الصحيحة
                                                         </Badge>
                                                    )}
                                                     {isSelected && !isCorrectOption && (
                                                         <Badge position="absolute" top="-10px" left="10px" colorScheme="red" variant="solid" borderRadius="full">
                                                            إجابتك
                                                         </Badge>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </SimpleGrid>
                                    
                                    {/* Explanation */}
                                    {ans.question.explanation && (
                                        <Box mt={2} p={3} bg="blue.50" borderRadius="md">
                                            <Heading size="xs" mb={1} color="blue.700">تفسير الإجابة:</Heading>
                                            <Text fontSize="sm" color="blue.800">{ans.question.explanation}</Text>
                                        </Box>
                                    )}
                                </Stack>
                            </CardBody>
                        </Card>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
