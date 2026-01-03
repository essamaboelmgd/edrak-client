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

interface StudentHomeworksTabProps {
    studentId: string;
}

export default function StudentHomeworksTab({ studentId }: StudentHomeworksTabProps) {
    const toast = useToast();
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeworks();
    }, [studentId]);

    const fetchHomeworks = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getStudentHomeworks(studentId);
            if (response.success && response.data) {
                setHomeworks(response.data.homeworks || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الواجبات',
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            submitted: 'blue',
            graded: 'green',
            pending: 'gray',
            late: 'red',
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

    if (homeworks.length === 0) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:clipboard-list-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا توجد واجبات
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
                            bg="teal.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                icon="solar:clipboard-list-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-teal-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                الواجبات
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {homeworks.length} واجب
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
                                    <Th>اسم الواجب</Th>
                                    <Th>الكورس</Th>
                                    <Th>الدرس</Th>
                                    <Th>التاريخ</Th>
                                    <Th>الدرجة</Th>
                                    <Th>الحالة</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {homeworks.map((homework) => (
                                    <Tr key={homework._id}>
                                        <Td>
                                            <Text fontWeight="medium">{homework.name}</Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {homework.course?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {homework.lesson?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {new Date(homework.date).toLocaleDateString('ar-EG')}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {homework.score || 0} / {homework.maxScore || 10}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(homework.status)}>
                                                {homework.status === 'submitted' ? 'تم التسليم' :
                                                 homework.status === 'graded' ? 'تم التصحيح' :
                                                 homework.status === 'late' ? 'متأخر' : 'قيد الانتظار'}
                                            </Badge>
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

