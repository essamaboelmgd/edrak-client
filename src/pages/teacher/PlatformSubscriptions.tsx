import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Stack,
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
  SimpleGrid,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  teacherSubscriptionService,
  TeacherSubscription,
} from '@/features/teacher/services/teacherSubscriptionService';

export default function PlatformSubscriptions() {
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

      if (currentResponse?.data) {
        if (currentResponse.data.subscription) {
          setCurrentSubscription(currentResponse.data.subscription);
        }
        if (currentResponse.data.statistics) {
          setStatistics(currentResponse.data.statistics);
        }
      }

      if (historyResponse?.data?.subscriptions) {
        setSubscriptionsHistory(historyResponse.data.subscriptions);
        if (historyResponse.data.statistics && !statistics) {
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
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, teal.600 0%, cyan.500 50%, blue.400 100%)"
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        color="white"
        boxShadow="xl"
      >
        {/* Decorative Blobs */}
        <Box
          position="absolute"
          top="-50%"
          right="-10%"
          width="400px"
          height="400px"
          bgGradient="radial(circle, whiteAlpha.200, transparent)"
          borderRadius="full"
          filter="blur(60px)"
        />

        <Flex
          position="relative"
          zIndex={1}
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'start', md: 'center' }}
          justify="space-between"
          gap={4}
        >
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon icon="solar:card-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                إدارة المنصة
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              اشتراكات المنصة
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض وإدارة اشتراكاتك على المنصة
            </Text>
          </VStack>
          {(!currentSubscription || currentSubscription.status === 'expired') && (
            <Button
              bg="white"
              color="teal.600"
              _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
              leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="20" height="20" />}
              size={{ base: 'md', md: 'lg' }}
              borderRadius="xl"
              shadow="md"
              transition="all 0.3s"
              onClick={() => (window.location.href = '/teacher/create-subscription')}
            >
              إنشاء اشتراك جديد
            </Button>
          )}
        </Flex>
      </Box>

      {/* Statistics */}
      {statistics && (
        <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={{ base: 4, md: 6 }}>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.200"
            bg="white"
            transition="all 0.3s"
            _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
          >
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.600" fontWeight="medium">
                    إجمالي الاشتراكات
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                    {statistics.totalSubscriptions || 0}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    اشتراك مسجل
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, blue.400, blue.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:card-bold-duotone"
                    width="32"
                    height="32"
                    style={{ color: 'white' }}
                  />
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.200"
            bg="white"
            transition="all 0.3s"
            _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
          >
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.600" fontWeight="medium">
                    نشط
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {statistics.activeSubscriptions || 0}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    اشتراك نشط
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, green.400, green.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:check-circle-bold-duotone"
                    width="32"
                    height="32"
                    style={{ color: 'white' }}
                  />
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.200"
            bg="white"
            transition="all 0.3s"
            _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
          >
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.600" fontWeight="medium">
                    إجمالي المصروف
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600" noOfLines={1}>
                    {formatCurrency(statistics.totalSpent || 0)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    مصروف
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, purple.400, purple.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:dollar-bold-duotone"
                    width="32"
                    height="32"
                    style={{ color: 'white' }}
                  />
                </Box>
              </HStack>
            </CardBody>
          </Card>

          {statistics.averageMonthlySpend && (
            <Card
              borderRadius="2xl"
              border="1px"
              borderColor="gray.200"
              bg="white"
              transition="all 0.3s"
              _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
            >
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      متوسط الإنفاق الشهري
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.600" noOfLines={1}>
                      {formatCurrency(statistics.averageMonthlySpend)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      شهري
                    </Text>
                  </VStack>
                  <Box
                    p={4}
                    borderRadius="xl"
                    bgGradient="linear(135deg, orange.400, orange.600)"
                    shadow="md"
                  >
                    <Icon
                      icon="solar:chart-2-bold-duotone"
                      width="32"
                      height="32"
                      style={{ color: 'white' }}
                    />
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          )}
        </SimpleGrid>
      )}

        {/* Current Subscription */}
        {currentSubscription && (
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.200"
            bg="white"
            boxShadow="xl"
          >
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
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.200"
          bg="white"
          boxShadow="xl"
        >
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
                        <Td colSpan={7} textAlign="center" py={12}>
                          <VStack spacing={4}>
                            <Box>
                              <Icon icon="solar:inbox-archive-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                            </Box>
                            <VStack spacing={2}>
                              <Text fontSize="lg" fontWeight="bold" color="gray.600">
                                لا توجد اشتراكات سابقة
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                ليس هناك نتائج لعرضها
                              </Text>
                            </VStack>
                          </VStack>
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
  );
}

