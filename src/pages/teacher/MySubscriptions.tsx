import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,

  useToast,
  Badge,
  Divider,
  Center,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  teacherSubscriptionService,
  TeacherSubscription,
} from '@/features/teacher/teacherSubscriptionService';

export default function MySubscriptions() {
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] =
    useState<TeacherSubscription | null>(null);
  const [subscriptionsHistory, setSubscriptionsHistory] = useState<
    TeacherSubscription[]
  >([]);
  const [statistics, setStatistics] = useState<any>(null);
  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch current subscription and history in parallel
      const [currentResponse, historyResponse] = await Promise.all([
        teacherSubscriptionService.getCurrentSubscription().catch(() => null),
        teacherSubscriptionService.getSubscriptionsHistory(),
      ]);

      if (currentResponse?.data?.subscription) {
        setCurrentSubscription(currentResponse.data.subscription);
        setStatistics(currentResponse.data.statistics);
      }

      if (historyResponse.data.subscriptions) {
        setSubscriptionsHistory(historyResponse.data.subscriptions);
        if (historyResponse.data.statistics) {
          setStatistics(historyResponse.data.statistics);
        }
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء جلب البيانات',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      active: { color: 'green', label: 'نشط' },
      expired: { color: 'orange', label: 'منتهي' },
      cancelled: { color: 'red', label: 'ملغي' },
      suspended: { color: 'yellow', label: 'معلق' },
    };
    const statusInfo = statusMap[status] || { color: 'gray', label: status };
    return (
      <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      paid: { color: 'green', label: 'مدفوع' },
      pending: { color: 'yellow', label: 'قيد الانتظار' },
      failed: { color: 'red', label: 'فشل' },
      refunded: { color: 'orange', label: 'مسترد' },
    };
    const statusInfo = statusMap[status] || { color: 'gray', label: status };
    return (
      <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  return (
    <Box p={6}>
      <Stack spacing={6}>
        {/* Statistics */}
        {statistics && (
          <StatGroup gap={3} display="grid" as={Stack} direction="row" flexWrap="wrap">
            <Stat as={Card} flexShrink={0} flex="max-content">
              <CardBody>
                <HStack gap={4}>
                  <Center
                    w={12}
                    h={12}
                    rounded={100}
                    bg="blue.500"
                    color="white"
                  >
                    <Icon
                      icon="solar:card-bold"
                      width="26"
                      height="26"
                    />
                  </Center>
                  <Box>
                    <StatNumber>{statistics.totalSubscriptions || 0}</StatNumber>
                    <StatLabel color="gray.500">إجمالي الاشتراكات</StatLabel>
                  </Box>
                </HStack>
              </CardBody>
            </Stat>
            <Stat as={Card} flexShrink={0} flex="max-content">
              <CardBody>
                <HStack gap={4}>
                  <Center
                    w={12}
                    h={12}
                    rounded={100}
                    bg="green.500"
                    color="white"
                  >
                    <Icon
                      icon="solar:check-circle-bold"
                      width="26"
                      height="26"
                    />
                  </Center>
                  <Box>
                    <StatNumber>{statistics.activeSubscriptions || 0}</StatNumber>
                    <StatLabel color="gray.500">الاشتراكات النشطة</StatLabel>
                  </Box>
                </HStack>
              </CardBody>
            </Stat>
            <Stat as={Card} flexShrink={0} flex="max-content">
              <CardBody>
                <HStack gap={4}>
                  <Center
                    w={12}
                    h={12}
                    rounded={100}
                    bg="purple.500"
                    color="white"
                  >
                    <Icon
                      icon="solar:dollar-bold"
                      width="26"
                      height="26"
                    />
                  </Center>
                  <Box>
                    <StatNumber>{formatCurrency(statistics.totalSpent || 0)}</StatNumber>
                    <StatLabel color="gray.500">إجمالي المصروف</StatLabel>
                  </Box>
                </HStack>
              </CardBody>
            </Stat>
            {statistics.averageMonthlySpend && (
              <Stat as={Card} flexShrink={0} flex="max-content">
                <CardBody>
                  <HStack gap={4}>
                    <Center
                      w={12}
                      h={12}
                      rounded={100}
                      bg="orange.500"
                      color="white"
                    >
                      <Icon
                        icon="solar:chart-2-bold"
                        width="26"
                        height="26"
                      />
                    </Center>
                    <Box>
                      <StatNumber>{formatCurrency(statistics.averageMonthlySpend)}</StatNumber>
                      <StatLabel color="gray.500">متوسط الإنفاق الشهري</StatLabel>
                    </Box>
                  </HStack>
                </CardBody>
              </Stat>
            )}
          </StatGroup>
        )}

        {/* Current Subscription */}
        {currentSubscription && (
          <Card>
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" fontSize="xl">
                  الاشتراك الحالي
                </Heading>
                <HStack justify="space-between" flexWrap="wrap" gap={4}>
                  <Stack>
                    <Text fontSize="sm" color="gray.600">
                      الخطة
                    </Text>
                    <Text fontWeight="bold">
                      {currentSubscription.plan === 'monthly'
                        ? 'شهري'
                        : currentSubscription.plan === 'quarterly'
                        ? 'ربع سنوي'
                        : currentSubscription.plan === 'semi_annual'
                        ? 'نصف سنوي'
                        : 'سنوي'}
                    </Text>
                  </Stack>
                  <Stack>
                    <Text fontSize="sm" color="gray.600">
                      السعر النهائي
                    </Text>
                    <Text fontWeight="bold" fontSize="lg" color="green.500">
                      {formatCurrency(currentSubscription.finalPrice)}
                    </Text>
                  </Stack>
                  <Stack>
                    <Text fontSize="sm" color="gray.600">
                      حالة الاشتراك
                    </Text>
                    {getStatusBadge(currentSubscription.status)}
                  </Stack>
                  <Stack>
                    <Text fontSize="sm" color="gray.600">
                      حالة الدفع
                    </Text>
                    {getPaymentStatusBadge(currentSubscription.paymentStatus)}
                  </Stack>
                  {currentSubscription.daysRemaining !== undefined && (
                    <Stack>
                      <Text fontSize="sm" color="gray.600">
                        الأيام المتبقية
                      </Text>
                      <Text
                        fontWeight="bold"
                        color={
                          currentSubscription.daysRemaining > 7
                            ? 'green.500'
                            : currentSubscription.daysRemaining > 0
                            ? 'orange.500'
                            : 'red.500'
                        }
                      >
                        {currentSubscription.daysRemaining} يوم
                      </Text>
                    </Stack>
                  )}
                </HStack>
                <Divider />
                <Stack>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    المميزات المختارة
                  </Text>
                  {currentSubscription.selectedFeatures.length > 0 ? (
                    <HStack flexWrap="wrap" gap={2}>
                      {currentSubscription.selectedFeatures.map((sf) => (
                        <Badge key={sf.feature._id} colorScheme="blue">
                          {sf.feature.nameArabic || sf.feature.name}
                        </Badge>
                      ))}
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      لا توجد مميزات مختارة
                    </Text>
                  )}
                </Stack>
                <HStack fontSize="sm" color="gray.600">
                  <Text>
                    تاريخ البدء: {formatDate(currentSubscription.startDate)}
                  </Text>
                  <Text>•</Text>
                  <Text>
                    تاريخ الانتهاء: {formatDate(currentSubscription.endDate)}
                  </Text>
                </HStack>
              </Stack>
            </CardBody>
          </Card>
        )}

        {/* Subscriptions History */}
        <Card>
          <CardBody>
            <Stack spacing={4}>
              <Heading as="h2" fontSize="xl">
                سجل الاشتراكات
              </Heading>
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>الخطة</Th>
                      <Th>السعر</Th>
                      <Th>حالة الاشتراك</Th>
                      <Th>حالة الدفع</Th>
                      <Th>تاريخ البدء</Th>
                      <Th>تاريخ الانتهاء</Th>
                      <Th>الأيام المتبقية</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading &&
                      Array.from({ length: 5 }).map((_, idx) => (
                        <Tr key={idx}>
                          {Array.from({ length: 7 }).map((_, index) => (
                            <Td key={index}>
                              <Skeleton h={4} rounded={3} />
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    {!loading &&
                      subscriptionsHistory.map((subscription) => (
                        <Tr key={subscription._id}>
                          <Td>
                            <Text fontSize="sm">
                              {subscription.plan === 'monthly'
                                ? 'شهري'
                                : subscription.plan === 'quarterly'
                                ? 'ربع سنوي'
                                : subscription.plan === 'semi_annual'
                                ? 'نصف سنوي'
                                : 'سنوي'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">
                              {formatCurrency(subscription.finalPrice)}
                            </Text>
                          </Td>
                          <Td>{getStatusBadge(subscription.status)}</Td>
                          <Td>
                            {getPaymentStatusBadge(subscription.paymentStatus)}
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {formatDate(subscription.startDate)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {formatDate(subscription.endDate)}
                            </Text>
                          </Td>
                          <Td>
                            <Text
                              fontSize="sm"
                              color={
                                subscription.daysRemaining > 7
                                  ? 'green.500'
                                  : subscription.daysRemaining > 0
                                  ? 'orange.500'
                                  : 'red.500'
                              }
                            >
                              {subscription.daysRemaining} يوم
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    {!loading && subscriptionsHistory.length === 0 && (
                      <Tr>
                        <Td colSpan={7} textAlign="center">
                          <Text color="gray.500">لا توجد اشتراكات سابقة</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}

