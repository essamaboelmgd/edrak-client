import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
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
  Button,
  useToast,
  Badge,
  Select,
  Avatar,

  Spacer,
  SimpleGrid,
  VStack,
  Flex,
  Checkbox,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  studentSubscriptionsService,
  StudentCourseSubscription,
} from '@/features/teacher/services/studentSubscriptionsService';
import { useSearchParams } from 'react-router-dom';

export default function StudentSubscriptions() {
  const [searchParams, setSearchParams] = useSearchParams({
    page: '1',
    limit: '10',
    search: '',
    paymentStatus: '',
    subscriptionType: '',
  });
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<StudentCourseSubscription[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toast = useToast();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      const paymentStatus = searchParams.get('paymentStatus') || undefined;
      const subscriptionType = searchParams.get('subscriptionType') || undefined;

      const response = await studentSubscriptionsService.getStudentSubscriptions({
        page,
        limit,
        search: search || undefined,
        paymentStatus: paymentStatus as any,
        subscriptionType: subscriptionType as any,
      });

      setSubscriptions(response.data.subscriptions || []);
      setStatistics(response.data.statistics);
      setPagination(response.data.pagination);
      setSelectedIds([]);
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
    fetchSubscriptions();
  }, [searchParams]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchParams((prev) => {
        prev.set('search', (e.target as HTMLInputElement).value);
        prev.set('page', '1');
        return prev;
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === subscriptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscriptions.map((s) => s._id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          studentSubscriptionsService.updatePaymentStatus(id, 'paid')
        )
      );
      toast({
        title: 'نجح',
        description: `تم تحديث حالة الدفع لـ ${selectedIds.length} اشتراك`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء التحديث',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePaymentStatus = async (
    subscriptionId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  ) => {
    try {
      await studentSubscriptionsService.updatePaymentStatus(subscriptionId, paymentStatus);
      toast({
        title: 'نجح',
        description: 'تم تحديث حالة الدفع بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء التحديث',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      paid: { color: 'green', label: 'مدفوع' },
      pending: { color: 'yellow', label: 'قيد الانتظار' },
      failed: { color: 'red', label: 'فشل' },
      refunded: { color: 'orange', label: 'مسترد' },
    };
    const statusInfo = statusMap[status] || { color: 'gray', label: status };
    return <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getSubscriptionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      lesson: 'درس',
      course: 'كورس',
      courseSection: 'قسم كورسات',
      lessonSection: 'قسم دروس',
    };
    return typeMap[type] || type;
  };

  const getSubscriptionTitle = (sub: StudentCourseSubscription) => {
    if (sub.course) return sub.course.title;
    if (sub.lesson) return sub.lesson.title;
    if (sub.courseSection) return sub.courseSection.name;
    if (sub.lessonSection) return sub.lessonSection.name;
    return '-';
  };

  const allSelected = subscriptions.length > 0 && selectedIds.length === subscriptions.length;

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
              اشتراكات الطلاب
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض وإدارة {pagination.total} اشتراك على المنصة
            </Text>
          </VStack>
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
                    مدفوع
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {statistics.paidSubscriptions || 0}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    اشتراك مدفوع
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
                    قيد الانتظار
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="yellow.600">
                    {statistics.pendingSubscriptions || 0}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    اشتراك قيد الانتظار
                  </Text>
                </VStack>
                <Box
                  p={4}
                  borderRadius="xl"
                  bgGradient="linear(135deg, yellow.400, yellow.600)"
                  shadow="md"
                >
                  <Icon
                    icon="solar:clock-circle-bold-duotone"
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
                    إجمالي الإيرادات
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600" noOfLines={1}>
                    {formatCurrency(statistics.totalRevenue || 0)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    إيرادات
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
        </SimpleGrid>
      )}

      {/* Filters */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="xl"
      >
        <CardBody>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            align={{ base: 'stretch', md: 'center' }}
            wrap="wrap"
          >
            <InputGroup flex={1} minW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon icon="solar:magnifer-bold-duotone" width="18" height="18" />
              </InputLeftElement>
              <Input
                type="search"
                placeholder="ابحث عن طالب أو كورس..."
                defaultValue={searchParams.get('search') || ''}
                onKeyDown={handleSearch}
                bg="white"
              />
            </InputGroup>

            <Select
              placeholder="نوع الاشتراك"
              value={searchParams.get('subscriptionType') || ''}
              onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
              bg="white"
              minW={{ base: '100%', md: '200px' }}
            >
              <option value="lesson">درس</option>
              <option value="course">كورس</option>
              <option value="courseSection">قسم كورسات</option>
              <option value="lessonSection">قسم دروس</option>
            </Select>

            <Select
              placeholder="حالة الدفع"
              value={searchParams.get('paymentStatus') || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              bg="white"
              minW={{ base: '100%', md: '200px' }}
            >
              <option value="paid">مدفوع</option>
              <option value="pending">قيد الانتظار</option>
              <option value="failed">فشل</option>
              <option value="refunded">مسترد</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Main Content */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="xl"
      >
        <CardBody>
          <Stack spacing={4}>
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Stack>
                <Heading as="h2" fontSize="xl">
                  اشتراكات الطلاب
                </Heading>
                <Text fontSize="smaller" fontWeight="medium">
                  النتائج {pagination.currentPage} / {pagination.totalPages} من{' '}
                  {pagination.total}
                </Text>
              </Stack>
              <Spacer />
              {selectedIds.length > 0 && (
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={handleBulkUpdate}
                >
                  تحديث حالة الدفع للطلاب المحددين ({selectedIds.length})
                </Button>
              )}
            </HStack>

            <TableContainer bg="white" rounded={10}>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={allSelected}
                          onChange={handleSelectAll}
                          aria-label="اختيار الكل"
                        />
                      </Th>
                      <Th>#</Th>
                      <Th>العنصر</Th>
                      <Th>الطالب</Th>
                      <Th>رقم الموبايل</Th>
                      <Th>السعر</Th>
                      <Th>حالة الدفع</Th>
                      <Th>تاريخ الاشتراك</Th>
                      <Th>الإجراءات</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading &&
                      Array.from({ length: 5 }).map((_, idx) => (
                        <Tr key={idx}>
                          {Array.from({ length: 9 }).map((_, index) => (
                            <Td key={index}>
                              <Skeleton h={4} rounded={3} />
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    {!loading &&
                      subscriptions.map((subscription) => (
                        <Tr key={subscription._id}>
                          <Td>
                            <Checkbox
                              isChecked={selectedIds.includes(subscription._id)}
                              onChange={() => handleSelectRow(subscription._id)}
                              aria-label={`اختيار الاشتراك ${subscription._id}`}
                            />
                          </Td>
                          <Td>{subscription._id.slice(-6)}</Td>
                          <Td>
                            <HStack>
                              <Badge colorScheme="blue">
                                {getSubscriptionTypeLabel(subscription.subscriptionType)}
                              </Badge>
                              <Text fontSize="sm" fontWeight="medium">
                                {getSubscriptionTitle(subscription)}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Avatar
                                name={subscription.student.firstName}
                                size="sm"
                              />
                              <Text fontSize="sm" fontWeight="medium">
                                {`${subscription.student.firstName} ${subscription.student.middleName} ${subscription.student.lastName}`}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">-</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">
                              {formatCurrency(subscription.finalPrice)}
                            </Text>
                          </Td>
                          <Td>{getPaymentStatusBadge(subscription.paymentStatus)}</Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(subscription.subscribedAt).toLocaleDateString('ar-EG')}
                            </Text>
                          </Td>
                          <Td>
                            {subscription.paymentStatus === 'pending' && (
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleUpdatePaymentStatus(subscription._id, 'paid')}
                              >
                                تحديث إلى مدفوع
                              </Button>
                            )}
                            {subscription.paymentStatus === 'paid' && (
                              <Text fontSize="sm" color="green.500" fontWeight="medium">
                                ✓ مدفوع
                              </Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    {!loading && subscriptions.length === 0 && (
                      <Tr>
                        <Td colSpan={9} textAlign="center" py={12}>
                          <VStack spacing={4}>
                            <Box>
                              <Icon icon="solar:inbox-archive-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
                            </Box>
                            <VStack spacing={2}>
                              <Text fontSize="lg" fontWeight="bold" color="gray.600">
                                لا توجد بيانات للعرض
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

              {/* Pagination */}
              <Card
                borderRadius="2xl"
                border="1px"
                borderColor="gray.200"
                bg="white"
                boxShadow="xl"
              >
                <CardBody>
                  <HStack justify="flex-end" spacing={3}>
                    <Button
                      size="sm"
                      fontWeight="medium"
                      borderRadius="xl"
                      h={8}
                      isDisabled={pagination.currentPage === 1 || loading}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      السابقة
                    </Button>
                    <Text fontSize="sm">
                      صفحة {pagination.currentPage} من {pagination.totalPages}
                    </Text>
                    <Button
                      size="sm"
                      fontWeight="medium"
                      borderRadius="xl"
                      h={8}
                      isDisabled={
                        pagination.currentPage === pagination.totalPages || loading
                      }
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      التالية
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
  );
}

