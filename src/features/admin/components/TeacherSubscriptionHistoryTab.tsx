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

interface TeacherSubscriptionHistoryTabProps {
    teacherId: string;
}

export default function TeacherSubscriptionHistoryTab({ teacherId }: TeacherSubscriptionHistoryTabProps) {
    const toast = useToast();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptionHistory();
    }, [teacherId]);

    const fetchSubscriptionHistory = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherSubscriptionHistory(teacherId);
            if (response.success && response.data) {
                setSubscriptions(response.data.subscriptions || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب سجل الاشتراكات',
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

    if (subscriptions.length === 0) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:history-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا يوجد سجل اشتراكات
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
                            bg="cyan.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                icon="solar:history-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-cyan-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                سجل الاشتراكات
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {subscriptions.length} اشتراك
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
                                    <Th>الخطة</Th>
                                    <Th>السعر</Th>
                                    <Th>الميزات</Th>
                                    <Th>حالة الدفع</Th>
                                    <Th>الحالة</Th>
                                    <Th>تاريخ البدء</Th>
                                    <Th>تاريخ الانتهاء</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {subscriptions.map((sub) => (
                                    <Tr key={sub._id}>
                                        <Td>
                                            <Badge colorScheme="purple">{sub.plan || 'غير محدد'}</Badge>
                                        </Td>
                                        <Td>
                                            <Text fontWeight="medium" color="green.600">
                                                EGP {sub.finalPrice?.toLocaleString() || 0}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {sub.selectedFeatures?.length || 0} ميزة
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={sub.paymentStatus === 'paid' ? 'green' : 'orange'}>
                                                {sub.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={sub.isActive ? 'green' : 'gray'}>
                                                {sub.isActive ? 'نشط' :
                                                 sub.status === 'expired' ? 'منتهي' :
                                                 sub.status === 'cancelled' ? 'ملغي' : 'غير نشط'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {new Date(sub.startDate).toLocaleDateString('ar-EG')}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {new Date(sub.endDate).toLocaleDateString('ar-EG')}
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

