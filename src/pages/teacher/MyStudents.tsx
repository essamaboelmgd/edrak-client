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
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import { myStudentsService, MyStudent } from '@/features/teacher/myStudentsService';
import { subscriptionService, StudentSubscription } from '@/features/teacher/subscriptionService';
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
                      icon="solar:users-group-two-rounded-bold"
                      width="26"
                      height="26"
                    />
                  </Center>
                  <Box>
                    <StatNumber>{statistics.totalStudents || 0}</StatNumber>
                    <StatLabel color="gray.500">إجمالي الطلاب</StatLabel>
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
                      icon="solar:user-check-rounded-bold"
                      width="26"
                      height="26"
                    />
                  </Center>
                  <Box>
                    <StatNumber>{statistics.activeStudents || 0}</StatNumber>
                    <StatLabel color="gray.500">الطلاب النشطين</StatLabel>
                  </Box>
                </HStack>
              </CardBody>
            </Stat>
            {statistics.byGender && (
              <>
                <Stat as={Card} flexShrink={0} flex="max-content">
                  <CardBody>
                    <HStack gap={4}>
                      <Center
                        w={12}
                        h={12}
                        rounded={100}
                        bg="blue.400"
                        color="white"
                      >
                        <Icon
                          icon="solar:user-bold"
                          width="26"
                          height="26"
                        />
                      </Center>
                      <Box>
                        <StatNumber>{statistics.byGender.male || 0}</StatNumber>
                        <StatLabel color="gray.500">ذكور</StatLabel>
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
                        bg="pink.400"
                        color="white"
                      >
                        <Icon
                          icon="solar:user-speak-rounded-bold"
                          width="26"
                          height="26"
                        />
                      </Center>
                      <Box>
                        <StatNumber>{statistics.byGender.female || 0}</StatNumber>
                        <StatLabel color="gray.500">إناث</StatLabel>
                      </Box>
                    </HStack>
                  </CardBody>
                </Stat>
              </>
            )}
          </HStack>
        )}

        {/* Main Content */}
        <Card>
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
                <InputGroup w={{ base: '100%', sm: '300px' }} size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Icon icon="lucide:search" width="15" height="15" />
                  </InputLeftElement>
                  <Input
                    type="search"
                    placeholder="ابحث عن طالب..."
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
                      <Th>#</Th>
                      <Th>الاسم</Th>
                      <Th>البريد الإلكتروني</Th>
                      <Th>رقم الموبايل</Th>
                      <Th>المستوى التعليمي</Th>
                      <Th>النوع</Th>
                      <Th>المحافظة</Th>
                      <Th>الحالة</Th>
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
                      students.map((student) => (
                        <StudentRow key={student._id} student={student} onUpdate={fetchStudents} />
                      ))}
                    {!loading && students.length === 0 && (
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

