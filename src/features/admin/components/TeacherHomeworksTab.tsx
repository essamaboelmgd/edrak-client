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

interface TeacherHomeworksTabProps {
    teacherId: string;
}

export default function TeacherHomeworksTab({ teacherId }: TeacherHomeworksTabProps) {
    const toast = useToast();
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeworks();
    }, [teacherId]);

    const fetchHomeworks = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherHomeworks(teacherId);
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
                                    <Th>المستوى</Th>
                                    <Th>التاريخ</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {homeworks.map((hw) => (
                                    <Tr key={hw._id}>
                                        <Td>
                                            <Text fontWeight="medium">{hw.name}</Text>
                                            {hw.details && (
                                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                    {hw.details}
                                                </Text>
                                            )}
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {hw.course?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {hw.lesson?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme="blue" fontSize="xs">
                                                {hw.level || '-'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {new Date(hw.date || hw.createdAt).toLocaleDateString('ar-EG')}
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

