import { SimpleGrid, Box, Card, CardBody, Heading, Text, Badge, Button, Flex, Icon, Stack } from '@chakra-ui/react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { IStudentExam } from '../types';
import { useNavigate } from 'react-router-dom';

interface ExamListProps {
    exams: IStudentExam[];
    isLoading: boolean;
}

export const ExamList = ({ exams, isLoading }: ExamListProps) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                {[1, 2, 3].map((i) => (
                    <Box key={i} h="250px" bg="gray.100" borderRadius="lg" />
                ))}
            </SimpleGrid>
        );
    }

    if (exams.length === 0) {
        return (
            <Box textAlign="center" py={10}>
                <Text fontSize="lg" color="gray.500">لا توجد اختبارات متاحة حالياً</Text>
            </Box>
        );
    }

    return (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {exams.map((exam) => (
                <Card key={exam._id} boxShadow="md" borderRadius="xl" overflow="hidden" _hover={{ transform: 'translateY(-4px)', transition: 'all 0.2s' }}>
                    <Box bg={exam.status === 'published' ? 'blue.500' : 'gray.500'} h="6px" />
                    <CardBody>
                        <Stack spacing={4}>
                            <Flex justify="space-between" align="start">
                                <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                                    {exam.course?.title || 'عام'}
                                </Badge>
                                {exam.isAttempted && (
                                    <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
                                        <Icon as={CheckCircle} size={12} />
                                        مكتمل
                                    </Badge>
                                )}
                            </Flex>

                            <Box>
                                <Heading size="md" mb={2} noOfLines={2}>{exam.title}</Heading>
                                <Text fontSize="sm" color="gray.500" noOfLines={2}>{exam.description}</Text>
                            </Box>

                            <SimpleGrid columns={2} gap={3} fontSize="sm" color="gray.600">
                                <Flex align="center" gap={2}>
                                    <Icon as={Clock} size={16} />
                                    <Text>{exam.duration} دقيقة</Text>
                                </Flex>
                                <Flex align="center" gap={2}>
                                    <Icon as={AlertCircle} size={16} />
                                    <Text>{exam.totalMarks} درجة</Text>
                                </Flex>
                            </SimpleGrid>

                            <Button 
                                colorScheme={exam.isAttempted ? 'green' : 'blue'}
                                variant={exam.isAttempted ? 'outline' : 'solid'}
                                width="full"
                                onClick={() => navigate(`/student/exams/${exam._id}/${exam.isAttempted ? 'results' : 'start'}`)}
                            >
                                {exam.isAttempted ? 'عرض النتائج' : 'ابدأ الاختبار'}
                            </Button>
                        </Stack>
                    </CardBody>
                </Card>
            ))}
        </SimpleGrid>
    );
};
