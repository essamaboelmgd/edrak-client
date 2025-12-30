import { useState, useEffect, useCallback } from 'react';
import {
    useToast,
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
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Badge,
    IconButton,
    SimpleGrid,
    VStack,
    Stack,
    Flex,
    Spacer,
    Skeleton,
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
    DiscountType,
} from '@/features/admin/services/couponsService';
import { teachersService } from '@/features/admin/services/teachersService';
import CreateCouponsModal from '@/features/admin/components/CreateCouponsModal';
import EditCouponModal from '@/features/admin/components/EditCouponModal';

export default function AdminCoupons() {
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
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
    const [teachers, setTeachers] = useState<any[]>([]);

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const response = await couponsService.getCoupons({
                page,
                limit: 20,
                targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as CouponTargetType) : undefined,
                discountType: discountTypeFilter !== 'all' ? (discountTypeFilter as DiscountType) : undefined,
                isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
                teacherId: teacherFilter !== 'all' ? teacherFilter : undefined,
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
    }, [page, targetTypeFilter, discountTypeFilter, statusFilter, teacherFilter, searchTerm, toast]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    // Fetch teachers for filter
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await teachersService.getAllTeachers({ limit: 1000 });
                if (response.success && response.data) {
                    setTeachers(response.data.teachers);
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };
        fetchTeachers();
    }, []);

    const handleDelete = async (couponId: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
            return;
        }

        try {
            await couponsService.deleteCoupon(couponId);
            toast({
                status: 'success',
                description: 'تم حذف الكوبون بنجاح',
            });
            fetchCoupons();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الكوبون',
            });
        }
    };

    const handleToggleActive = async (coupon: ICoupon) => {
        try {
            await couponsService.updateCoupon(coupon._id, {
                isActive: !coupon.isActive,
            });
            toast({
                status: 'success',
                description: `تم ${coupon.isActive ? 'تعطيل' : 'تفعيل'} الكوبون بنجاح`,
            });
            fetchCoupons();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تحديث الكوبون',
            });
        }
    };

    const handleEdit = (coupon: ICoupon) => {
        setSelectedCoupon(coupon);
        setShowEditModal(true);
    };

    const handleExport = () => {
        const header = ['#', 'الكود', 'النوع', 'الهدف', 'المدرس', 'نوع الخصم', 'قيمة الخصم', 'الحد الأقصى', 'الاستخدامات الحالية', 'الحالة', 'تاريخ الانتهاء', 'تاريخ الإنشاء'];
        const rows = coupons.map((coupon, idx) => [
            idx + 1,
            coupon.code,
            getTargetTypeLabel(coupon.targetType),
            getTargetLabel(coupon),
            typeof coupon.teacher === 'object' ? `${coupon.teacher.firstName} ${coupon.teacher.lastName}` : '-',
            coupon.discountType === 'percentage' ? 'نسبة' : 'مبلغ ثابت',
            coupon.discountValue,
            coupon.maxUses || 'غير محدود',
            coupon.currentUses,
            coupon.isActive ? 'نشط' : 'غير نشط',
            coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG') : 'غير محدد',
            new Date(coupon.createdAt).toLocaleDateString('ar-EG'),
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
    };

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
        active: coupons.filter((c) => c.isActive && !c.isExpired && !c.isMaxedOut).length,
        inactive: coupons.filter((c) => !c.isActive).length,
        expired: coupons.filter((c) => c.isExpired).length,
        percentage: coupons.filter((c) => c.discountType === 'percentage').length,
        fixed: coupons.filter((c) => c.discountType === 'fixed').length,
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
            {/* Modern Hero Header */}
            <Box
                bgGradient="linear(135deg, yellow.600 0%, orange.500 50%, red.400 100%)"
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
                            عرض وإدارة جميع كوبونات الخصم ({total} كوبون)
                        </Text>
                    </VStack>
                    <HStack spacing={3}>
                        <Button
                            bg="whiteAlpha.200"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-2px)', shadow: 'lg' }}
                            onClick={handleExport}
                            leftIcon={<Icon icon="solar:download-bold-duotone" width="20" height="20" />}
                            size={{ base: 'md', md: 'lg' }}
                            borderRadius="xl"
                            shadow="md"
                            transition="all 0.3s"
                        >
                            تصدير
                        </Button>
                        <Button
                            bg="white"
                            color="orange.600"
                            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                            onClick={() => setShowCreateModal(true)}
                            leftIcon={<Icon icon="solar:add-circle-bold-duotone" width="20" height="20" />}
                            size={{ base: 'md', md: 'lg' }}
                            borderRadius="xl"
                            shadow="md"
                            transition="all 0.3s"
                        >
                            إنشاء كوبونات جديدة
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 6 }} spacing={{ base: 4, md: 6 }}>
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
                                    كوبون متاح
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, yellow.400, yellow.600)"
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
                                    الكوبونات النشطة
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
                                    غير النشطة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.600">
                                    {stats.inactive}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كوبون معطل
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, gray.400, gray.600)"
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
                                    المنتهية
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
                                    نسبة مئوية
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                    {stats.percentage}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كوبون نسبة
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, blue.400, blue.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:percent-bold-duotone"
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
                                    مبلغ ثابت
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {stats.fixed}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كوبون ثابت
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, purple.400, purple.600)"
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
            </SimpleGrid>

            {/* Filters Section */}
            <Card borderRadius="2xl" border="1px" borderColor="gray.200" bg="white">
                <CardBody>
                    <Flex direction={{ base: 'column', md: 'row' }} gap={4} flexWrap="wrap">
                        <InputGroup flex="1" minW="200px">
                            <InputLeftElement pointerEvents="none">
                                <Icon icon="solar:magnifer-bold-duotone" width="20" height="20" color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="ابحث بالكود..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                bg="white"
                            />
                        </InputGroup>
                        <Select
                            w={{ base: '100%', md: '200px' }}
                            value={targetTypeFilter}
                            onChange={(e) => {
                                setTargetTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            bg="white"
                        >
                            <option value="all">كل الأنواع</option>
                            <option value="course">كورس</option>
                            <option value="lesson">درس</option>
                            <option value="courseSection">قسم كورسات</option>
                            <option value="lessonSection">قسم دروس</option>
                        </Select>
                        <Select
                            w={{ base: '100%', md: '200px' }}
                            value={discountTypeFilter}
                            onChange={(e) => {
                                setDiscountTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            bg="white"
                        >
                            <option value="all">كل أنواع الخصم</option>
                            <option value="percentage">نسبة مئوية</option>
                            <option value="fixed">مبلغ ثابت</option>
                        </Select>
                        <Select
                            w={{ base: '100%', md: '200px' }}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            bg="white"
                        >
                            <option value="all">الكل</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </Select>
                        <Select
                            w={{ base: '100%', md: '200px' }}
                            value={teacherFilter}
                            onChange={(e) => {
                                setTeacherFilter(e.target.value);
                                setPage(1);
                            }}
                            bg="white"
                        >
                            <option value="all">كل المدرسين</option>
                            {teachers.map((teacher) => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()}
                                </option>
                            ))}
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
                                    <Th>الكود</Th>
                                    <Th>النوع</Th>
                                    <Th>الهدف</Th>
                                    <Th>المدرس</Th>
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
                                            {Array.from({ length: 9 }).map((_, i) => (
                                                <Td key={i}>
                                                    <Skeleton height="20px" />
                                                </Td>
                                            ))}
                                        </Tr>
                                    ))
                                ) : coupons.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={9} textAlign="center" py={8}>
                                            <VStack spacing={2}>
                                                <Icon icon="solar:ticket-bold-duotone" width="48" height="48" color="gray.300" />
                                                <Text color="gray.500" fontSize="sm" fontWeight="medium">
                                                    لا توجد كوبونات خصم
                                                </Text>
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
                                            <Td fontSize="sm" fontWeight="medium">{getTargetLabel(coupon)}</Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {typeof coupon.teacher === 'object'
                                                    ? `${coupon.teacher.firstName} ${coupon.teacher.lastName}`
                                                    : '-'}
                                            </Td>
                                            <Td fontWeight="bold" color="green.500" fontSize="sm">
                                                {getDiscountLabel(coupon)}
                                            </Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {coupon.currentUses} / {coupon.maxUses || '∞'}
                                            </Td>
                                            <Td>{getStatusBadge(coupon)}</Td>
                                            <Td fontSize="sm" fontWeight="medium">
                                                {coupon.expiresAt
                                                    ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG')
                                                    : 'غير محدد'}
                                            </Td>
                                            <Td>
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        aria-label="تعديل"
                                                        icon={<Icon icon="solar:pen-bold-duotone" />}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        onClick={() => handleEdit(coupon)}
                                                        rounded={2}
                                                        h={8}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        fontWeight="medium"
                                                        h={8}
                                                        rounded={2}
                                                        colorScheme={coupon.isActive ? 'orange' : 'green'}
                                                        onClick={() => handleToggleActive(coupon)}
                                                    >
                                                        {coupon.isActive ? 'تعطيل' : 'تفعيل'}
                                                    </Button>
                                                    <IconButton
                                                        aria-label="حذف"
                                                        icon={<Icon icon="solar:trash-bin-trash-bold-duotone" />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(coupon._id)}
                                                        rounded={2}
                                                        h={8}
                                                    />
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

            {/* Modals */}
            <CreateCouponsModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchCoupons}
            />
            <EditCouponModal
                coupon={selectedCoupon}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedCoupon(null);
                }}
                onSuccess={fetchCoupons}
            />
        </Stack>
    );
}

