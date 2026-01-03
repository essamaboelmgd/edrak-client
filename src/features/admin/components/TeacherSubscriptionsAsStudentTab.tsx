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

interface TeacherSubscriptionsAsStudentTabProps {
    teacherId: string;
}

export default function TeacherSubscriptionsAsStudentTab({ teacherId }: TeacherSubscriptionsAsStudentTabProps) {
    const toast = useToast();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, [teacherId]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getTeacherSubscriptionsAsStudent(teacherId);
            if (response.success && response.data) {
                setSubscriptions(response.data.subscriptions || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب الاشتراكات',
            });
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            course: 'كورس',
            lesson: 'درس',
            courseSection: 'قسم',
        };
        return labels[type] || type;
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
                            icon="solar:card-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا توجد اشتراكات كطالب
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
                            bg="indigo.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                icon="solar:card-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-indigo-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                الاشتراكات كطالب
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
                                    <Th>النوع</Th>
                                    <Th>العنوان</Th>
                                    <Th>السعر</Th>
                                    <Th>حالة الدفع</Th>
                                    <Th>الحالة</Th>
                                    <Th>تاريخ الاشتراك</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {subscriptions.map((sub) => (
                                    <Tr key={sub._id}>
                                        <Td>
                                            <Badge colorScheme="blue">{getTypeLabel(sub.type)}</Badge>
                                        </Td>
                                        <Td>
                                            <Text fontWeight="medium">
                                                {sub.course?.title || sub.lesson?.title || sub.section?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontWeight="medium" color="green.600">
                                                EGP {sub.finalPrice?.toLocaleString() || 0}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={sub.paymentStatus === 'paid' ? 'green' : 'orange'}>
                                                {sub.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={sub.status === 'active' ? 'green' : 'gray'}>
                                                {sub.status === 'active' ? 'نشط' :
                                                 sub.status === 'expired' ? 'منتهي' :
                                                 sub.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {new Date(sub.startDate).toLocaleDateString('ar-EG')}
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

