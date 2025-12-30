import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  useDisclosure,
  Skeleton,
  Text,
  Divider,
  SimpleGrid,
  Stack,
  Flex,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  subscriptionsService,
  UpdatePaymentStatusData,
} from '@/features/admin/services/subscriptionsService';
import { TeacherSubscription } from '@/features/teacher/services/teacherSubscriptionService';

export default function AdminSubscriptions() {
  const toast = useToast();
  const [subscriptions, setSubscriptions] = useState<TeacherSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<TeacherSubscription | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } =
    useDisclosure();
  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onClose: onPaymentClose,
  } = useDisclosure();
  const [paymentData, setPaymentData] = useState<UpdatePaymentStatusData>({
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentStatusFilter !== 'all') params.paymentStatus = paymentStatusFilter;

      const response = await subscriptionsService.getAllSubscriptions(params);
      if (response.success) {
        setSubscriptions(response.data.subscriptions);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء جلب الاشتراكات',
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
  }, [page, statusFilter, paymentStatusFilter]);

  const handleViewDetails = (subscription: TeacherSubscription) => {
    setSelectedSubscription(subscription);
    onDetailsOpen();
  };

  const handleMarkAsPaid = (subscription: TeacherSubscription) => {
    setSelectedSubscription(subscription);
    setPaymentData({
      transactionId: subscription.transactionId || '',
      paymentDate: subscription.paymentDate
        ? new Date(subscription.paymentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    onPaymentOpen();
  };

  const handleUpdatePayment = async () => {
    if (!selectedSubscription) return;
    try {
      await subscriptionsService.updatePaymentStatus(
        selectedSubscription._id,
        paymentData
      );
      toast({
        title: 'نجح',
        description: 'تم تحديث حالة الدفع بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPaymentClose();
      setSelectedSubscription(null);
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الدفع',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };


  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      active: { color: 'green', label: 'نشط' },
      expired: { color: 'orange', label: 'منتهي' },
      cancelled: { color: 'red', label: 'ملغي' },
      suspended: { color: 'yellow', label: 'معلق' },
    };
    const statusInfo = statusMap[status] || { color: 'gray', label: status };
    return <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>;
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

  const getPlanLabel = (plan: string) => {
    const planMap: Record<string, string> = {
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      semi_annual: 'نصف سنوي',
      annual: 'سنوي',
    };
    return planMap[plan] || plan;
  };

  // Calculate stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    expired: subscriptions.filter((s) => s.status === 'expired').length,
    paid: subscriptions.filter((s) => s.paymentStatus === 'paid').length,
    pending: subscriptions.filter((s) => s.paymentStatus === 'pending').length,
  };

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, indigo.600 0%, purple.500 50%, pink.400 100%)"
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
              إدارة اشتراكات المدرسين
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض وإدارة جميع اشتراكات المدرسين
            </Text>
          </VStack>
        </Flex>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={{ base: 4, md: 6 }}>
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
                  {stats.total}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  اشتراك متاح
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, indigo.400, indigo.600)"
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
                  الاشتراكات النشطة
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {stats.active}
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
                  الاشتراكات المنتهية
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                  {stats.expired}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  اشتراك منتهي
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, orange.400, orange.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:calendar-mark-bold-duotone"
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
                  المدفوعة
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {stats.paid}
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
                  icon="solar:wallet-money-bold-duotone"
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
                  {stats.pending}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  اشتراك معلق
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, yellow.400, yellow.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:hourglass-line-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters Section */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Select
              w={{ base: '100%', md: '200px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              bg="white"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="expired">منتهي</option>
              <option value="cancelled">ملغي</option>
              <option value="suspended">معلق</option>
            </Select>
            <Select
              w={{ base: '100%', md: '200px' }}
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              bg="white"
            >
              <option value="all">جميع حالات الدفع</option>
              <option value="pending">قيد الانتظار</option>
              <option value="paid">مدفوع</option>
              <option value="failed">فشل</option>
              <option value="refunded">مسترد</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Table Section */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
        <CardBody>
          <TableContainer>
            <Table colorScheme="gray" rounded={10}>
              <Thead>
                <Tr>
                  <Th>المدرس</Th>
                  <Th>الخطة</Th>
                  <Th>المميزات</Th>
                  <Th>السعر النهائي</Th>
                  <Th>حالة الاشتراك</Th>
                  <Th>حالة الدفع</Th>
                  <Th>تاريخ البدء</Th>
                  <Th>تاريخ الانتهاء</Th>
                  <Th>الإجراءات</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <Tr key={idx}>
                      {Array.from({ length: 9 }).map((_, i) => (
                        <Td key={i}>
                          <Skeleton height="20px" />
                        </Td>
                      ))}
                    </Tr>
                  ))
                ) : subscriptions.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={8}>
                      <VStack spacing={2}>
                        <Icon icon="solar:card-bold-duotone" width="48" height="48" color="gray.300" />
                        <Text color="gray.500" fontSize="sm" fontWeight="medium">
                          لا توجد اشتراكات
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  subscriptions.map((subscription) => (
                    <Tr key={subscription._id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">
                            {subscription.teacher.fullName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {subscription.teacher.email}
                          </Text>
                        </VStack>
                      </Td>
                      <Td fontSize="sm" fontWeight="medium">{getPlanLabel(subscription.plan)}</Td>
                      <Td fontSize="sm" fontWeight="medium">
                        {subscription.selectedFeatures.length} ميزة
                      </Td>
                      <Td fontWeight="bold" color="green.500" fontSize="sm">
                        {formatCurrency(subscription.finalPrice)}
                      </Td>
                      <Td>{getStatusBadge(subscription.status)}</Td>
                      <Td>{getPaymentStatusBadge(subscription.paymentStatus)}</Td>
                      <Td fontSize="sm" fontWeight="medium">{formatDate(subscription.startDate)}</Td>
                      <Td fontSize="sm" fontWeight="medium">{formatDate(subscription.endDate)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            fontWeight="medium"
                            h={8}
                            rounded={2}
                            colorScheme="blue"
                            onClick={() => handleViewDetails(subscription)}
                          >
                            التفاصيل
                          </Button>
                          {subscription.paymentStatus === 'pending' && (
                            <Button
                              size="sm"
                              fontWeight="medium"
                              h={8}
                              rounded={2}
                              colorScheme="green"
                              onClick={() => handleMarkAsPaid(subscription)}
                            >
                              قبول الدفع
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
          <CardBody>
            <HStack justify="center" spacing={4}>
              <Button
                size="sm"
                fontWeight="medium"
                h={8}
                rounded={2}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                isDisabled={page === 1}
              >
                السابق
              </Button>
              <Text fontSize="sm" fontWeight="medium">
                صفحة {page} من {totalPages}
              </Text>
              <Button
                size="sm"
                fontWeight="medium"
                h={8}
                rounded={2}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                isDisabled={page === totalPages}
              >
                التالي
              </Button>
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تفاصيل الاشتراك</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSubscription && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    معلومات المدرس
                  </Text>
                  <Text>الاسم: {selectedSubscription.teacher.fullName}</Text>
                  <Text>البريد: {selectedSubscription.teacher.email}</Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    معلومات الاشتراك
                  </Text>
                  <Text>الخطة: {getPlanLabel(selectedSubscription.plan)}</Text>
                  <Text>السعر الأساسي: {formatCurrency(selectedSubscription.basePrice)}</Text>
                  <Text>
                    سعر المميزات: {formatCurrency(selectedSubscription.featuresPrice)}
                  </Text>
                  <Text>الخصم: {selectedSubscription.discount}%</Text>
                  <Text fontWeight="bold" color="green.500">
                    السعر النهائي: {formatCurrency(selectedSubscription.finalPrice)}
                  </Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    المميزات المختارة
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {selectedSubscription.selectedFeatures.map((sf) => (
                      <HStack key={sf.feature._id} justify="space-between">
                        <Text>{sf.feature.nameArabic || sf.feature.name}</Text>
                        <Text fontWeight="bold">{formatCurrency(sf.price)}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    معلومات الدفع
                  </Text>
                  <Text>طريقة الدفع: {selectedSubscription.paymentMethod}</Text>
                  <Text>حالة الدفع: {getPaymentStatusBadge(selectedSubscription.paymentStatus)}</Text>
                  {selectedSubscription.transactionId && (
                    <Text>رقم المعاملة: {selectedSubscription.transactionId}</Text>
                  )}
                  {selectedSubscription.paymentDate && (
                    <Text>تاريخ الدفع: {formatDate(selectedSubscription.paymentDate)}</Text>
                  )}
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    التواريخ
                  </Text>
                  <Text>تاريخ البدء: {formatDate(selectedSubscription.startDate)}</Text>
                  <Text>تاريخ الانتهاء: {formatDate(selectedSubscription.endDate)}</Text>
                  {selectedSubscription.daysRemaining !== undefined && (
                    <Text>
                      الأيام المتبقية:{' '}
                      <Badge
                        colorScheme={
                          selectedSubscription.daysRemaining > 7
                            ? 'green'
                            : selectedSubscription.daysRemaining > 0
                            ? 'orange'
                            : 'red'
                        }
                      >
                        {selectedSubscription.daysRemaining} يوم
                      </Badge>
                    </Text>
                  )}
                </Box>
                {selectedSubscription.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        ملاحظات
                      </Text>
                      <Text>{selectedSubscription.notes}</Text>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              إغلاق
            </Button>
            {selectedSubscription?.paymentStatus === 'pending' && (
              <Button
                colorScheme="green"
                onClick={() => {
                  onDetailsClose();
                  handleMarkAsPaid(selectedSubscription);
                }}
              >
                قبول الدفع
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تحديث حالة الدفع</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>رقم المعاملة</FormLabel>
                <Input
                  value={paymentData.transactionId}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, transactionId: e.target.value })
                  }
                  placeholder="أدخل رقم المعاملة"
                />
              </FormControl>
              <FormControl>
                <FormLabel>تاريخ الدفع</FormLabel>
                <Input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paymentDate: e.target.value })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPaymentClose}>
              إلغاء
            </Button>
            <Button colorScheme="green" onClick={handleUpdatePayment}>
              تأكيد الدفع
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}

