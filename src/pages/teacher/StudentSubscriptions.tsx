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
  Button,
  useToast,
  Badge,
  Select,
  Center,
  Avatar,
  Wrap,
  WrapItem,
  Spacer,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  studentSubscriptionsService,
  StudentCourseSubscription,
} from '@/features/teacher/studentSubscriptionsService';
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
    <Box p={6}>
      <Stack spacing={6}>
        {/* Statistics */}
        {statistics && (
          <HStack spacing={4} flexWrap="wrap" align="stretch">
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
                    <StatNumber>{statistics.paidSubscriptions || 0}</StatNumber>
                    <StatLabel color="gray.500">المدفوعة</StatLabel>
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
                    bg="yellow.500"
                    color="white"
                  >
                    <Icon
                      icon="solar:clock-circle-bold"
                      width="26"
                      height="26"
                    />
                  </Center>
                  <Box>
                    <StatNumber>{statistics.pendingSubscriptions || 0}</StatNumber>
                    <StatLabel color="gray.500">قيد الانتظار</StatLabel>
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
                    <StatNumber>{formatCurrency(statistics.totalRevenue || 0)}</StatNumber>
                    <StatLabel color="gray.500">إجمالي الإيرادات</StatLabel>
                  </Box>
                </HStack>
              </CardBody>
            </Stat>
          </HStack>
        )}

        {/* Filters */}
        <Wrap spacing={4}>
          <WrapItem>
            <Select
              placeholder="نوع الاشتراك"
              value={searchParams.get('subscriptionType') || ''}
              onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
              bg="white"
              w="200px"
            >
              <option value="lesson">درس</option>
              <option value="course">كورس</option>
              <option value="courseSection">قسم كورسات</option>
              <option value="lessonSection">قسم دروس</option>
            </Select>
          </WrapItem>
          <WrapItem>
            <Select
              placeholder="حالة الدفع"
              value={searchParams.get('paymentStatus') || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              bg="white"
              w="200px"
            >
              <option value="paid">مدفوع</option>
              <option value="pending">قيد الانتظار</option>
              <option value="failed">فشل</option>
              <option value="refunded">مسترد</option>
            </Select>
          </WrapItem>
        </Wrap>

        {/* Main Content */}
        <Card>
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
                <InputGroup w={{ base: '100%', sm: '300px' }} size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Icon icon="lucide:search" width="15" height="15" />
                  </InputLeftElement>
                  <Input
                    type="search"
                    placeholder="ابحث عن طالب أو كورس..."
                    defaultValue={searchParams.get('search') || ''}
                    onKeyDown={handleSearch}
                    bg="white"
                  />
                </InputGroup>
              </HStack>

              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>
                        <input
                          type="checkbox"
                          checked={allSelected}
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
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(subscription._id)}
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
                        <Td colSpan={9} textAlign="center">
                          <Text color="gray.500">لا توجد بيانات للعرض</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <HStack justify="flex-end" spacing={2}>
                <Button
                  size="sm"
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
                  isDisabled={
                    pagination.currentPage === pagination.totalPages || loading
                  }
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  التالية
                </Button>
              </HStack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}

