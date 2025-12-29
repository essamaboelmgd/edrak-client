import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { examService } from '@/features/student/services/examService';
import { Box, Container, Heading, Text, CircularProgress, CircularProgressLabel, Flex, Button } from '@chakra-ui/react';
import { CheckCircle, XCircle } from 'lucide-react';

const ExamResults = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const { data: results, isLoading } = useQuery({
        queryKey: ['student', 'exam', examId, 'results'],
        queryFn: () => examService.getExamResults(examId!),
        enabled: !!examId
    });

    if (isLoading) return <Box p={10} textAlign="center">جاري تحميل النتائج...</Box>;

    if (!results) return <Box p={10}>لم يتم العثور على نتائج.</Box>;

    const percentage = (results.score / results.totalMarks) * 100;
    const isPassed = percentage >= (results.passingScore || 50);

    return (
        <Container maxW="container.md" py={10}>
            <Box bg="white" p={10} borderRadius="2xl" shadow="lg" textAlign="center">
                <Heading mb={2}>{isPassed ? 'مبروك! اجتزت الاختبار' : 'حظ أوفر المرة القادمة'}</Heading>
                <Text color="gray.500" mb={8}>تم الانتهاء من {results.examTitle}</Text>

                <Flex justify="center" mb={10}>
                    <CircularProgress value={percentage} size="150px" color={isPassed ? 'green.400' : 'red.400'} thickness="8px">
                        <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                            {Math.round(percentage)}%
                        </CircularProgressLabel>
                    </CircularProgress>
                </Flex>

                <Flex justify="center" gap={8} mb={8}>
                    <Box>
                        <Text color="gray.500" fontSize="sm">الدرجة</Text>
                        <Text fontSize="xl" fontWeight="bold">{results.score} / {results.totalMarks}</Text>
                    </Box>
                    <Box>
                        <Text color="gray.500" fontSize="sm">النتيجة</Text>
                        <Flex align="center" gap={1} justify="center">
                            {isPassed ? <CheckCircle color="green" /> : <XCircle color="red" />}
                            <Text fontWeight="bold" color={isPassed ? 'green.500' : 'red.500'}>
                                {isPassed ? 'ناجح' : 'راسب'}
                            </Text>
                        </Flex>
                    </Box>
                </Flex>

                <Button colorScheme="blue" onClick={() => navigate('/student/exams')}>العودة للاختبارات</Button>
            </Box>
        </Container>
    );
};

export default ExamResults;
