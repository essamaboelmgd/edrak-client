import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
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
  SimpleGrid,
  VStack,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';
import {
  couponsService,
  ICoupon,
  CouponTargetType,
} from '@/features/admin/services/couponsService';
import CreateCouponsModal from '@/features/admin/components/CreateCouponsModal';
import EditCouponModal from '@/features/admin/components/EditCouponModal';

export default function TeacherCoupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await couponsService.getCoupons({
        page,
        limit: 20,
        targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as CouponTargetType) : undefined,
        discountType: discountTypeFilter !== 'all' ? (discountTypeFilter as any) : undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        code: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setCoupons(response.data.coupons);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء جلب الكوبونات',
      });
    } finally {
      setLoading(false);
    }
  }, [page, targetTypeFilter, discountTypeFilter, statusFilter, searchTerm, toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const getTargetTypeLabel = (type: CouponTargetType): string => {
    const labels: Record<CouponTargetType, string> = {
      course: 'كورس',
      lesson: 'درس',
      courseSection: 'قسم كورسات',
      lessonSection: 'قسم دروس',
    };
    return labels[type] || type;
  };

  const getTargetLabel = (coupon: ICoupon): string => {
    if (coupon.course) return coupon.course.title;
    if (coupon.lesson) return coupon.lesson.title;
    if (coupon.courseSection) return coupon.courseSection.name;
    if (coupon.lessonSection) return coupon.lessonSection.name;
    return '-';
  };

  const getDiscountLabel = (coupon: ICoupon): string => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    return `${coupon.discountValue.toLocaleString()} ج.م`;
  };

  const getStatusBadge = (coupon: ICoupon) => {
    if (!coupon.isActive) {
      return <Badge colorScheme="gray">غير نشط</Badge>;
    }
    if (coupon.isExpired) {
      return <Badge colorScheme="red">منتهي</Badge>;
    }
    if (coupon.isMaxedOut) {
      return <Badge colorScheme="orange">وصل للحد الأقصى</Badge>;
    }
    return <Badge colorScheme="green">نشط</Badge>;
  };

  // Calculate stats
  const stats = {
    total,
    active: coupons.filter(c => c.isActive && !c.isExpired && !c.isMaxedOut).length,
    expired: coupons.filter(c => c.isExpired).length,
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
              <Icon icon="solar:ticket-bold-duotone" width={24} height={24} />
              <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                إدارة المنصة
              </Text>
            </HStack>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
              كوبونات الخصم
            </Text>
            <Text fontSize="sm" opacity={0.95}>
              عرض وإنشاء {total} كوبون خصم على المنصة
            </Text>
          </VStack>
          <Button
            bg="white"
            color="teal.600"
            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
            leftIcon={<Icon icon="solar:ticket-sale-bold-duotone" width="20" height="20" />}
            size={{ base: 'md', md: 'lg' }}
            borderRadius="xl"
            shadow="md"
            transition="all 0.3s"
            onClick={() => setShowCreateModal(true)}
          >
            إنشاء كوبونات جديدة
          </Button>
          <Button
            bg="white"
            color="teal.600"
            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
            leftIcon={<Icon icon="solar:export-bold-duotone" width="20" height="20" />}
            size={{ base: 'md', md: 'lg' }}
            borderRadius="xl"
            shadow="md"
            transition="all 0.3s"
            onClick={async () => {
              setExportLoading(true);
              try {
                // Fetch all coupons for export (limit 10000)
                const response = await couponsService.getCoupons({
                  limit: 10000,
                  targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as CouponTargetType) : undefined,
                  discountType: discountTypeFilter !== 'all' ? (discountTypeFilter as any) : undefined,
                  isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
                  code: searchTerm || undefined,
                });

                if (response.success && response.data) {
                  const couponsToExport = response.data.coupons;
                  if (couponsToExport.length === 0) {
                      toast({ status: 'warning', description: 'لا توجد بيانات للتصدير' });
                      return;
                  }

                  const header = ['#', 'الكود', 'النوع', 'الهدف', 'نوع الخصم', 'الخصم', 'الاستخدامات', 'الحالة', 'تاريخ الانتهاء'];
                  const rows = couponsToExport.map((coupon, idx) => [
                      idx + 1,
                      coupon.code,
                      getTargetTypeLabel(coupon.targetType),
                      getTargetLabel(coupon),
                      coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت',
                      coupon.discountValue,
                      `${coupon.currentUses} / ${coupon.maxUses || '∞'}`,
                      coupon.isActive ? (coupon.isExpired ? 'منحي' : coupon.isMaxedOut ? 'حد أقصى' : 'نشط') : 'غير نشط',
                      coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG') : 'غير محدد',
                  ]);
                  
                  const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
                  const BOM = '\uFEFF';
                  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `coupons_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              } catch (error) {
                  console.error('Export failed', error);
                  toast({ status: 'error', description: 'فشل التصدير' });
              } finally {
                  setExportLoading(false);
              }
            }}
            isLoading={exportLoading}
          >
            تصدير الكل
          </Button>
        </Flex>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={{ base: 4, md: 6 }}>
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
                  إجمالي الكوبونات
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  {stats.total}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كوبون مسجل
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, pink.400, pink.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:ticket-bold-duotone"
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
                  {stats.active}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كوبون نشط
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
                  منتهي
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                  {stats.expired}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  كوبون منتهي
                </Text>
              </VStack>
              <Box
                p={4}
                borderRadius="xl"
                bgGradient="linear(135deg, red.400, red.600)"
                shadow="md"
              >
                <Icon
                  icon="solar:close-circle-bold-duotone"
                  width="32"
                  height="32"
                  style={{ color: 'white' }}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

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
            <InputGroup flex={1} minW={{ base: '100%', md: '200px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon icon="solar:magnifer-bold-duotone" width="18" height="18" />
              </InputLeftElement>
              <Input
                placeholder="بحث بالكود..."
                bg="white"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </InputGroup>

            <Select
              bg="white"
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
              placeholder="النوع"
              minW={{ base: '100%', md: '200px' }}
            >
              <option value="all">كل الأنواع</option>
              <option value="course">كورس</option>
              <option value="lesson">درس</option>
              <option value="courseSection">قسم كورسات</option>
              <option value="lessonSection">قسم دروس</option>
            </Select>

            <Select
              bg="white"
              value={discountTypeFilter}
              onChange={(e) => {
                setDiscountTypeFilter(e.target.value);
                setPage(1);
              }}
              placeholder="نوع الخصم"
              minW={{ base: '100%', md: '150px' }}
            >
              <option value="all">كل أنواع الخصم</option>
              <option value="percentage">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
            </Select>

            <Select
              bg="white"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              placeholder="الحالة"
              minW={{ base: '100%', md: '150px' }}
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Table */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        bg="white"
        boxShadow="xl"
      >
        <CardBody>
          <Stack spacing={4}>
            <HStack justify="space-between" flexWrap="wrap">
              <Stack>
                <Heading fontSize="xl">كوبونات الخصم</Heading>
                <Text fontSize="sm" color="gray.500">
                  النتائج {page} / {totalPages} من {total}
                </Text>
              </Stack>
            </HStack>

            <TableContainer bg="white" rounded={10}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>الكود</Th>
                    <Th>النوع</Th>
                    <Th>الهدف</Th>
                    <Th>الخصم</Th>
                    <Th>الاستخدامات</Th>
                    <Th>الحالة</Th>
                    <Th>تاريخ الانتهاء</Th>
                    <Th>إجراءات</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <Td key={i}>
                            <Skeleton h={4} rounded={3} />
                          </Td>
                        ))}
                      </Tr>
                    ))
                  ) : coupons.length === 0 ? (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py={12}>
                        <VStack spacing={4}>
                          <Box>
                            <Icon icon="solar:ticket-bold-duotone" width="60" height="60" style={{ color: '#718096' }} />
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
                  ) : (
                    coupons.map((coupon) => (
                      <Tr key={coupon._id}>
                        <Td>
                          <Text fontFamily="mono" fontWeight="bold" fontSize="sm">
                            {coupon.code}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue">
                            {getTargetTypeLabel(coupon.targetType)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {getTargetLabel(coupon)}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium" color="green.700">
                            {getDiscountLabel(coupon)}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {coupon.currentUses} / {coupon.maxUses || '∞'}
                          </Text>
                        </Td>
                        <Td>
                          {getStatusBadge(coupon)}
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG')
                              : 'غير محدد'}
                          </Text>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              aria-label="Options"
                              icon={<Icon icon="solar:menu-dots-bold" width="20" />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem
                                icon={<Icon icon="solar:pen-bold-duotone" width="20" />}
                                onClick={() => {
                                  setSelectedCoupon(coupon);
                                  setShowEditModal(true);
                                }}
                              >
                                تعديل
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
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
                      isDisabled={loading || page >= totalPages}
                      isLoading={loading}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      التالية
                    </Button>
                    <Text fontSize="sm">
                      صفحة {page} من {totalPages}
                    </Text>
                    <Button
                      size="sm"
                      fontWeight="medium"
                      borderRadius="xl"
                      h={8}
                      isDisabled={loading || page === 1}
                      isLoading={loading}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      السابقة
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            )}
          </Stack>
        </CardBody>
      </Card>

      {/* Create Modal */}
      <CreateCouponsModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCoupons}
      />

      <EditCouponModal
        isOpen={showEditModal}
        onClose={() => {
            setShowEditModal(false);
            setSelectedCoupon(null);
        }}
        onSuccess={fetchCoupons}
        coupon={selectedCoupon}
      />
    </Stack>
  );
}
