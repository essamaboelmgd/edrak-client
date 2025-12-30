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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { myStudentsService, MyStudent } from '@/features/teacher/services/myStudentsService';
import { subscriptionService, StudentSubscription } from '@/features/teacher/services/subscriptionService';
import { useSearchParams } from 'react-router-dom';

export default function MyStudents() {
  const [searchParams, setSearchParams] = useSearchParams({
    page: '1',
    limit: '10',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const toast = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';

      const response = await myStudentsService.getMyStudents({
        page,
        limit,
        search: search || undefined,
      });

      setStudents(response.data.students || []);
      setStatistics(response.data.statistics);
      setPagination(response.data.pagination);
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
    fetchStudents();
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

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  return (
    <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
      {/* Modern Hero Header */}
      <Box
        bgGradient="linear(135deg, purple.600 0%, blue.500 50%, teal.400 100%)"
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
              <Icon icon="solar:users-group-rounded-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                إدارة المنصة
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              طلابي
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض وإدارة {pagination.total} طالب على المنصة
            </Text>
          </VStack>
        </Flex>
      </Box>

      {/* Statistics */}
      {statistics && (
        <SimpleGrid columns={{ base: 2, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
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
                      إجمالي الطلاب
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                      {statistics.totalStudents || 0}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      طالب مسجل
                    </Text>
                  </VStack>
                  <Box
                    p={4}
                    borderRadius="xl"
                    bgGradient="linear(135deg, blue.400, blue.600)"
                    shadow="md"
                  >
                    <Icon
                      icon="solar:users-group-rounded-bold-duotone"
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
                      الطلاب النشطين
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" color="green.600">
                      {statistics.activeStudents || 0}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      طالب نشط
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
            {statistics.byGender && (
              <>
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
                          ذكور
                        </Text>
                        <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                          {statistics.byGender.male || 0}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          طالب
                        </Text>
                      </VStack>
                      <Box
                        p={4}
                        borderRadius="xl"
                        bgGradient="linear(135deg, blue.400, blue.600)"
                        shadow="md"
                      >
                        <Icon
                          icon="solar:user-bold-duotone"
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
                          إناث
                        </Text>
                        <Text fontSize="3xl" fontWeight="bold" color="pink.600">
                          {statistics.byGender.female || 0}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          طالبة
                        </Text>
                      </VStack>
                      <Box
                        p={4}
                        borderRadius="xl"
                        bgGradient="linear(135deg, pink.400, pink.600)"
                        shadow="md"
                      >
                        <Icon
                          icon="solar:user-speak-rounded-bold-duotone"
                          width="32"
                          height="32"
                          style={{ color: 'white' }}
                        />
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              </>
            )}
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
            >
              <InputGroup flex={1} minW={{ base: '100%', md: '300px' }}>
                <InputLeftElement pointerEvents="none">
                  <Icon
                    icon="solar:magnifer-bold-duotone"
                    width="20"
                    height="20"
                  />
                </InputLeftElement>
                <Input
                  type="search"
                  placeholder="ابحث عن طالب..."
                  defaultValue={searchParams.get('search') || ''}
                  onKeyDown={handleSearch}
                  bg="white"
                />
              </InputGroup>
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
                    طلابي
                  </Heading>
                  <Text fontSize="smaller" fontWeight="medium">
                    النتائج {pagination.currentPage} / {pagination.totalPages} من{' '}
                    {pagination.total}
                  </Text>
                </Stack>
              </HStack>

              <TableContainer bg="white" rounded={10}>
                <Table colorScheme="gray">
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>الاسم</Th>
                      <Th>البريد الإلكتروني</Th>
                      <Th>رقم الموبايل</Th>
                      <Th>المستوى التعليمي</Th>
                      <Th>رصيد المحفظة</Th>
                      <Th>نقاط الترتيب</Th>
                      <Th>المستوى</Th>
                      <Th>النوع</Th>
                      <Th>المحافظة</Th>
                      <Th>الحالة</Th>
                      <Th>آخر تسجيل دخول</Th>
                      <Th>الإجراءات</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading &&
                      Array.from({ length: 5 }).map((_, idx) => (
                        <Tr key={idx}>
                          {Array.from({ length: 13 }).map((_, index) => (
                            <Td key={index}>
                              <Skeleton h={4} rounded={3} />
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    {!loading &&
                      students.map((student) => (
                        <StudentRow key={student._id} student={student} onUpdate={fetchStudents} />
                      ))}
                    {!loading && students.length === 0 && (
                      <Tr>
                        <Td colSpan={13} textAlign="center" py={12}>
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
              {pagination.totalPages > 1 && (
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
                        isLoading={loading}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        leftIcon={<Icon icon="solar:alt-arrow-right-bold-duotone" width="16" height="16" />}
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
                        isLoading={loading}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        rightIcon={<Icon icon="solar:alt-arrow-left-bold-duotone" width="16" height="16" />}
                      >
                        التالية
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
  );
}

// Student Row Component with Subscriptions
function StudentRow({ student, onUpdate }: { student: MyStudent; onUpdate: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subscriptions, setSubscriptions] = useState<StudentSubscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const toast = useToast();

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubs(true);
      const response = await subscriptionService.getStudentSubscriptions(student._id);
      setSubscriptions(response.data.subscriptions || []);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء جلب الاشتراكات',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleUpdatePaymentStatus = async (
    subscriptionId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  ) => {
    try {
      await subscriptionService.updatePaymentStatus(subscriptionId, paymentStatus);
      toast({
        title: 'نجح',
        description: 'تم تحديث حالة الدفع بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchSubscriptions();
      onUpdate();
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

  const handleOpenModal = () => {
    onOpen();
    fetchSubscriptions();
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

  return (
    <>
      <Tr>
        <Td>{student._id.slice(-6)}</Td>
        <Td>
          <Text fontWeight="medium">{student.fullName}</Text>
        </Td>
        <Td>
          <Text fontSize="sm">{student.email}</Text>
        </Td>
        <Td>
          <Text fontSize="sm">{student.mobileNumber}</Text>
        </Td>
        <Td>
          {student.educationalLevel ? (
            <Text fontSize="sm">{student.educationalLevel.name}</Text>
          ) : (
            <Text fontSize="sm" color="gray.400">
              -
            </Text>
          )}
        </Td>
        <Td>
          <HStack spacing={1}>
            <Icon icon="solar:wallet-money-bold" width="14" height="14" color="#16a34a" />
            <Text fontSize="sm" fontWeight="medium" color="green.600">
              {student.wallet?.amount?.toLocaleString() || 0} ج.م
            </Text>
          </HStack>
        </Td>
        <Td>
          <HStack spacing={1}>
            <Icon icon="solar:trophy-bold" width="14" height="14" color="#f59e0b" />
            <Text fontSize="sm" fontWeight="medium" color="yellow.600">
              {student.leaderboardRank?.value?.toLocaleString() || 0} xp
            </Text>
          </HStack>
        </Td>
        <Td>
          <HStack spacing={1}>
            <Icon icon="solar:graph-up-bold" width="14" height="14" color="#6366f1" />
            <Text fontSize="sm" fontWeight="medium" color="blue.600">
              {student.level?.value?.toLocaleString() || 0} xp
            </Text>
          </HStack>
        </Td>
        <Td>
          <Badge colorScheme={student.gender === 'male' ? 'blue' : 'pink'}>
            {student.gender === 'male' ? 'ذكر' : 'أنثى'}
          </Badge>
        </Td>
        <Td>
          <Text fontSize="sm">{student.governorate || '-'}</Text>
        </Td>
        <Td>
          <Badge colorScheme={student.isActive ? 'green' : 'red'}>
            {student.isActive ? 'نشط' : 'غير نشط'}
          </Badge>
        </Td>
        <Td>
          <Text fontSize="sm" color="gray.600">
            {student.lastLogin
              ? new Date(student.lastLogin).toLocaleDateString('ar-EG')
              : '-'}
          </Text>
        </Td>
        <Td>
          <Button size="sm" colorScheme="blue" onClick={handleOpenModal}>
            <Icon icon="solar:card-bold" width="16" height="16" style={{ marginLeft: '4px' }} />
            الاشتراكات
          </Button>
        </Td>
      </Tr>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>اشتراكات {student.fullName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loadingSubs ? (
              <Stack spacing={2}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} h={20} rounded={3} />
                ))}
              </Stack>
            ) : subscriptions.length === 0 ? (
              <Text textAlign="center" color="gray.500" py={8}>
                لا توجد اشتراكات لهذا الطالب
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {subscriptions.map((sub) => (
                  <Card key={sub._id}>
                    <CardBody>
                      <Stack spacing={3}>
                        <HStack justify="space-between">
                          <Badge colorScheme="blue">
                            {getSubscriptionTypeLabel(sub.subscriptionType)}
                          </Badge>
                          {getPaymentStatusBadge(sub.paymentStatus)}
                        </HStack>
                        <Text fontWeight="bold">
                          {sub.course?.title ||
                            sub.lesson?.title ||
                            sub.courseSection?.name ||
                            sub.lessonSection?.name ||
                            '-'}
                        </Text>
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">السعر:</Text>
                          <Text fontWeight="bold">{formatCurrency(sub.finalPrice)}</Text>
                        </HStack>
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">طريقة الدفع:</Text>
                          <Text>
                            {sub.paymentMethod === 'cash'
                              ? 'نقدي'
                              : sub.paymentMethod === 'credit_card'
                              ? 'بطاقة ائتمان'
                              : sub.paymentMethod === 'mobile_wallet'
                              ? 'محفظة إلكترونية'
                              : 'تحويل بنكي'}
                          </Text>
                        </HStack>
                        {sub.paymentStatus === 'pending' && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleUpdatePaymentStatus(sub._id, 'paid')}
                          >
                            تحديث حالة الدفع إلى مدفوع
                          </Button>
                        )}
                        {sub.paymentStatus === 'paid' && (
                          <Text fontSize="sm" color="green.500" fontWeight="medium">
                            ✓ تم الدفع
                          </Text>
                        )}
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

