
import { Box, Card, CardBody, Heading, Text, Badge, Button, Flex, Icon, Stack, SimpleGrid } from '@chakra-ui/react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { IStudentExam } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ExamCardProps {
    exam: IStudentExam;
    isSubscribed?: boolean;
    isLocked?: boolean;
}

export const ExamCard = ({ exam, isLocked = false }: ExamCardProps) => {
    const navigate = useNavigate();

    // Combined lock state
    // User requested strictly sequential locking. The parent calculates 'isLocked' based on sequence.
    // We strictly use that, ignoring subscription status here.
    const isActuallyLocked = isLocked;

    return (
        <Card boxShadow="md" borderRadius="xl" overflow="hidden" _hover={!isActuallyLocked ? { transform: 'translateY(-4px)', transition: 'all 0.2s' } : {}} opacity={isActuallyLocked ? 0.7 : 1}>
            <Box bg={exam.status === 'published' ? 'blue.500' : 'gray.500'} h="6px" />
            <CardBody position="relative">
                 {isActuallyLocked && (
                    <Box position="absolute" inset={0} bg="whiteAlpha.600" zIndex={1} display="flex" alignItems="center" justifyContent="center">
                        <Badge colorScheme="orange" py={1} px={3} borderRadius="md" display="flex" alignItems="center" gap={2}>
                            <Icon as={AlertCircle} />
                            مقفل (أكمل السابق)
                        </Badge>
                    </Box>
                )}
                <Stack spacing={4} filter={isActuallyLocked ? 'blur(1px)' : 'none'}>
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
                        colorScheme={(exam.myAttempts && exam.myAttempts > 0) ? 'green' : 'blue'}
                        variant={(exam.myAttempts && exam.myAttempts > 0) ? 'outline' : 'solid'}
                        width="full"
                        isDisabled={isActuallyLocked}
                        onClick={() => {
                            if (exam.myAttempts && exam.myAttempts > 0) {
                                navigate(`/student/exams/${exam._id}/results`);
                            } else {
                                navigate(`/student/exams/${exam._id}/start`);
                            }
                        }}
                    >
                        {/* Always show exam actions unless locked by sequence. Ignored subscription check as requested */}
                        {((exam.myAttempts && exam.myAttempts > 0) ? 'عرض النتائج' : 'ابدأ الاختبار')}
                    </Button>
                </Stack>
            </CardBody>
        </Card>
    );
};
