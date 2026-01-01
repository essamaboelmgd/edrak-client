import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    Skeleton,
    useToast,
    Heading,
    Box,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { studentsService } from '../services/studentsService';

interface StudentGradesTabProps {
    studentId: string;
}

export default function StudentGradesTab({ studentId }: StudentGradesTabProps) {
    const toast = useToast();
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, [studentId]);

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getStudentGrades(studentId);
            if (response.success && response.data) {
                setGrades(response.data.grades || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الدرجات',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <Stack spacing={4}>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} height="100px" borderRadius="lg" />
                        ))}
                    </Stack>
                </CardBody>
            </Card>
        );
    }

    if (grades.length === 0) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:diploma-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا توجد درجات
                        </Text>
                    </VStack>
                </CardBody>
            </Card>
        );
    }

    return (
        <Stack spacing={4}>
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm" bg="white">
                <Stack p={5} spacing={4}>
                    <HStack spacing={3}>
                        <Box
                            w={10}
                            h={10}
                            borderRadius="lg"
                            bg="yellow.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                icon="solar:diploma-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-yellow-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                الدرجات
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {grades.length} كورس
                            </Text>
                        </Stack>
                    </HStack>
                </Stack>
            </Card>

            <Accordion allowMultiple>
                {grades.map((grade) => (
                    <AccordionItem key={grade.courseId} border="none" mb={4}>
                        <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                            <AccordionButton>
                                <Box flex="1" textAlign="right">
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold">{grade.courseTitle}</Text>
                                            <HStack spacing={4}>
                                                <Text fontSize="sm" color="gray.600">
                                                    امتحانات: {grade.examScore} نقطة
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    واجبات: {grade.homeworkScore} نقطة
                                                </Text>
                                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                                    الإجمالي: {grade.totalScore} نقطة
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                                <Stack spacing={4}>
                                    {grade.exams.length > 0 && (
                                        <Box>
                                            <Text fontWeight="bold" mb={2}>الامتحانات:</Text>
                                            {grade.exams.map((exam: any, idx: number) => (
                                                <HStack key={idx} justify="space-between" mb={1}>
                                                    <Text fontSize="sm">{exam.title}</Text>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {exam.score} / {exam.maxScore}
                                                    </Text>
                                                </HStack>
                                            ))}
                                        </Box>
                                    )}
                                    {grade.homeworks.length > 0 && (
                                        <Box>
                                            <Text fontWeight="bold" mb={2}>الواجبات:</Text>
                                            {grade.homeworks.map((hw: any, idx: number) => (
                                                <HStack key={idx} justify="space-between" mb={1}>
                                                    <Text fontSize="sm">{hw.name}</Text>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {hw.score} / {hw.maxScore}
                                                    </Text>
                                                </HStack>
                                            ))}
                                        </Box>
                                    )}
                                </Stack>
                            </AccordionPanel>
                        </Card>
                    </AccordionItem>
                ))}
            </Accordion>
        </Stack>
    );
}

