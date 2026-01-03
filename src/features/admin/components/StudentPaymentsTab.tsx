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

interface StudentPaymentsTabProps {
    studentId: string;
}

export default function StudentPaymentsTab({ studentId }: StudentPaymentsTabProps) {
    const toast = useToast();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, [studentId]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getStudentPayments(studentId);
            if (response.success && response.data) {
                setPayments(response.data.payments || []);
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء جلب المدفوعات',
            });
        } finally {
            setLoading(false);
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            cash: 'نقدي',
            credit_card: 'بطاقة ائتمانية',
            mobile_wallet: 'محفظة إلكترونية',
            bank_transfer: 'تحويل بنكي',
            wallet: 'محفظة',
            center_payment: 'دفع في المركز',
        };
        return labels[method] || method;
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

    if (payments.length === 0) {
        return (
            <Card borderRadius="xl" border="1px" borderColor="gray.200" boxShadow="sm">
                <CardBody>
                    <VStack py={12} spacing={4}>
                        <Icon
                            icon="solar:wallet-money-bold-duotone"
                            width="64"
                            height="64"
                            style={{ color: 'var(--chakra-colors-gray-300)' }}
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                            لا توجد مدفوعات
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
                            bg="green.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                icon="solar:wallet-money-bold-duotone"
                                width="24"
                                height="24"
                                style={{ color: 'var(--chakra-colors-green-600)' }}
                            />
                        </Box>
                        <Stack spacing={0}>
                            <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.800">
                                سجل المدفوعات
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                إجمالي {payments.length} عملية دفع
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
                                    <Th>المبلغ</Th>
                                    <Th>طريقة الدفع</Th>
                                    <Th>تاريخ الدفع</Th>
                                    <Th>الحالة</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {payments.map((payment) => (
                                    <Tr key={payment._id}>
                                        <Td>
                                            <Badge colorScheme="purple">
                                                {payment.type === 'course' ? 'كورس' :
                                                 payment.type === 'lesson' ? 'درس' :
                                                 payment.type === 'section' ? 'قسم' : payment.type}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontWeight="medium">
                                                {payment.item?.title || '-'}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontWeight="bold" color="green.600">
                                                EGP {payment.amount?.toLocaleString() || 0}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {getPaymentMethodLabel(payment.paymentMethod)}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color="gray.600">
                                                {new Date(payment.paymentDate).toLocaleDateString('ar-EG')}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={payment.status === 'paid' ? 'green' : 'gray'}>
                                                {payment.status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}
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

