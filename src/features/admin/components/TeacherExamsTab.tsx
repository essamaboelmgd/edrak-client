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
import { teachersService } from '../services/teachersService';

interface TeacherExamsTabProps {
    teacherId: string;
}

export default function TeacherExamsTab({ teacherId }: TeacherExamsTabProps) {
    const toast = useToast();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, [teacherId]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherExams(teacherId);
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
                                    <Th>عنوان الامتحان</Th>
                                    <Th>الكورس</Th>
                                    <Th>الدرس</Th>
                                    <Th>المدة</Th>
                                    <Th>الحالة</Th>
                                    <Th>التاريخ</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {exams.map((exam) => (
                                    <Tr key={exam._id}>
                                        <Td>
                                            <Text fontWeight="medium">{exam.title}</Text>
                                            {exam.description && (
                                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                    {exam.description}
                                                </Text>
                                            )}
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
                                            <Text fontSize="sm" color="gray.600">
                                                {exam.duration ? `${exam.duration} دقيقة` : '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge
                                                colorScheme={exam.draft ? 'gray' : exam.status === 'active' ? 'green' : 'red'}
                                                fontSize="xs"
                                            >
                                                {exam.draft ? 'مسودة' : exam.status === 'active' ? 'نشط' : 'معطل'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {new Date(exam.createdAt).toLocaleDateString('ar-EG')}
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

