import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Stack,
    Text,
    HStack,
    VStack,
    Badge,
    Skeleton,
    useToast,
    Heading,
    Box,
    Table,
    TableContainer,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { studentsService } from '../services/studentsService';

interface StudentExamsTabProps {
    studentId: string;
}

export default function StudentExamsTab({ studentId }: StudentExamsTabProps) {
    const toast = useToast();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, [studentId]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getStudentExams(studentId);
            if (response.success && response.data) {
                setExams(response.data.exams || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الامتحانات',
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            completed: 'green',
            in_progress: 'blue',
            pending: 'gray',
            failed: 'red',
        };
        return colors[status] || 'gray';
    };

    if (loading) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <Stack spacing={4}>
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} height="60px" borderRadius="lg" />
                        ))}
                    </Stack>
                </CardBody>
            </Card>
        );
    }

    if (exams.length === 0) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:document-text-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا توجد امتحانات
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
                            bg="red.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                icon="solar:document-text-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-red-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                الامتحانات
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {exams.length} امتحان
                            </Text>
                        </Stack>
                    </HStack>
                </Stack>
            </Card>

            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody px={0}>
                    <TableContainer>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>اسم الامتحان</Th>
                                    <Th>الكورس</Th>
                                    <Th>الدرس</Th>
                                    <Th>الدرجة</Th>
                                    <Th>الحالة</Th>
                                    <Th>تاريخ البدء</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {exams.map((exam) => (
                                    <Tr key={exam._id}>
                                        <Td>
                                            <Text fontWeight="medium">{exam.title}</Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {exam.course?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {exam.lesson?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {exam.score || 0} / {exam.maxScore || 100}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(exam.status)}>
                                                {exam.status === 'completed' ? 'مكتمل' :
                                                 exam.status === 'in_progress' ? 'قيد التنفيذ' :
                                                 exam.status === 'failed' ? 'فاشل' : 'قيد الانتظار'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {exam.startedAt ? new Date(exam.startedAt).toLocaleDateString('ar-EG') : '-'}
                                            </Text>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </CardBody>
            </Card>
        </Stack>
    );
}

