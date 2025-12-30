import { useState, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import {
    useToast,
    HStack,
    VStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Button,
    Text,
  
    Box,
    SimpleGrid,
    Card,
    CardBody,
    Stack,
    Flex,
    Spacer,
    Tooltip,
    IconButton,
} from '@chakra-ui/react';
import { teachersService, ITeacherAdmin } from '@/features/admin/services/teachersService';
import TeachersTable from '@/features/admin/components/TeachersTable';
import TeacherCard from '@/features/admin/components/TeacherCard';
import TeacherDetailsModal from '@/features/admin/components/TeacherDetailsModal';
import CreateTeacherModal from '@/features/admin/components/CreateTeacherModal';
import EditTeacherModal from '@/features/admin/components/EditTeacherModal';

export default function AdminTeachers() {
    const toast = useToast();
    const [teachers, setTeachers] = useState<ITeacherAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [selectedTeacher, setSelectedTeacher] = useState<ITeacherAdmin | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await teachersService.getAllTeachers({
                page,
                limit: 20,
                search: searchTerm || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });

            if (response.success && response.data) {
                setTeachers(response.data.teachers);
                setTotalPages(response.data.pagination.totalPages);
                setTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast({
                status: 'error',
                description: 'حدث خطأ أثناء جلب البيانات',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, [page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchTeachers();
            } else {
                setPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    const handleViewDetails = (teacher: ITeacherAdmin) => {
        setSelectedTeacher(teacher);
        setShowDetailsModal(true);
        setShowEditModal(false);
    };

    const handleEdit = (teacher: ITeacherAdmin) => {
        setSelectedTeacher(teacher);
        setShowEditModal(true);
        setShowDetailsModal(false);
    };

    const handleSuspend = async (teacherId: string) => {
        try {
            await teachersService.suspendTeacher(teacherId);
            toast({
                status: 'success',
                description: 'تم إيقاف المدرس بنجاح',
            });
            fetchTeachers();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إيقاف المدرس',
            });
        }
    };

    const handleUnsuspend = async (teacherId: string) => {
        try {
            await teachersService.unsuspendTeacher(teacherId);
            toast({
                status: 'success',
                description: 'تم تفعيل المدرس بنجاح',
            });
            fetchTeachers();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تفعيل المدرس',
            });
        }
    };

    const handleDelete = async (teacherId: string) => {
        try {
            await teachersService.deleteTeacher(teacherId);
            toast({
                status: 'success',
                description: 'تم حذف المدرس بنجاح',
            });
            fetchTeachers();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف المدرس',
            });
        }
    };

    const handleBlock = async (teacherId: string) => {
        try {
            await teachersService.blockUser(teacherId);
            toast({
                status: 'success',
                description: 'تم حظر المدرس بنجاح',
            });
            fetchTeachers();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حظر المدرس',
            });
        }
    };

    const handleUnblock = async (teacherId: string) => {
        try {
            await teachersService.unblockUser(teacherId);
            toast({
                status: 'success',
                description: 'تم إلغاء حظر المدرس بنجاح',
            });
            fetchTeachers();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إلغاء حظر المدرس',
            });
        }
    };

    // Calculate stats
    const stats = {
        total,
        active: teachers.filter((t) => t.isActive).length,
        inactive: teachers.filter((t) => !t.isActive).length,
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
                            جميع المعلمين
                        </Text>
                        <Text fontSize="sm" opacity={0.95}>
                            عرض وإدارة {total} معلم على المنصة
                        </Text>
                    </VStack>
                    <Button
                        bg="white"
                        color="purple.600"
                        _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                        onClick={() => setShowCreateModal(true)}
                        leftIcon={<Icon icon="solar:user-plus-bold-duotone" width="20" height="20" />}
                        size={{ base: 'md', md: 'lg' }}
                        borderRadius="xl"
                        shadow="md"
                        transition="all 0.3s"
                    >
                        إضافة معلم جديد
                    </Button>
                </Flex>
            </Box>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 4, md: 6 }}>
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
                                    إجمالي المعلمين
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {stats.total}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    معلم مسجل
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, purple.400, purple.600)"
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
                                    المعلمين النشطين
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                    {stats.active}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    معلم نشط
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
                                    المعلمين غير النشطين
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                                    {stats.inactive}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    معلم غير نشط
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, red.400, red.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:eye-closed-bold-duotone"
                                    width="32"
                                    height="32"
                                    style={{ color: 'white' }}
                                />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters and Controls */}
            <Card borderRadius="xl" border="1px" borderColor="gray.200">
                <CardBody>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        gap={4}
                        align={{ base: 'stretch', md: 'center' }}
                    >
                        <InputGroup flex={{ base: '1', md: '0 0 300px' }} size="md">
                            <InputLeftElement pointerEvents="none">
                                <Icon
                                    icon="solar:magnifer-bold-duotone"
                                    width="20"
                                    height="20"
                                    style={{ color: 'var(--chakra-colors-gray-400)' }}
                                />
                            </InputLeftElement>
                            <Input
                                type="search"
                                placeholder="ابحث بالاسم أو الرابط..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg="white"
                                borderRadius="lg"
                            />
                        </InputGroup>

                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            bg="white"
                            borderRadius="lg"
                            maxW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط فقط</option>
                            <option value="trial">تجريبي</option>
                            <option value="suspended">معطل</option>
                            <option value="expired">منتهي</option>
                        </Select>

                        <Spacer />

                        <HStack spacing={2}>
                            <Tooltip label="عرض شبكي">
                                <IconButton
                                    aria-label="Grid view"
                                    icon={<Icon icon="solar:widget-5-bold-duotone" width="20" height="20" />}
                                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                                    colorScheme="purple"
                                    onClick={() => setViewMode('grid')}
                                />
                            </Tooltip>
                            <Tooltip label="عرض قائمة">
                                <IconButton
                                    aria-label="List view"
                                    icon={<Icon icon="solar:list-bold-duotone" width="20" height="20" />}
                                    variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                    colorScheme="purple"
                                    onClick={() => setViewMode('table')}
                                />
                            </Tooltip>
                        </HStack>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                            leftIcon={<Icon icon="solar:restart-bold-duotone" width="16" height="16" />}
                        >
                            إعادة تعيين
                        </Button>
                    </Flex>
                </CardBody>
            </Card>

            {/* Results Count */}
            <HStack justify="space-between" px={2}>
                <Text fontSize="sm" color="gray.600">
                    عرض {teachers.length} من {total} معلم
                </Text>
                {totalPages > 0 && (
                    <Text fontSize="sm" color="gray.600">
                        صفحة {page} من {totalPages}
                    </Text>
                )}
            </HStack>

            {/* Content */}
            {viewMode === 'table' ? (
                <TeachersTable
                    teachers={teachers}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    loading={loading}
                />
            ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                    {loading ? (
                        <Box gridColumn="1 / -1" textAlign="center" py={12}>
                            <Text color="gray.500">جاري التحميل...</Text>
                        </Box>
                    ) : teachers.length === 0 ? (
                        <Card borderRadius="xl" border="1px" borderColor="gray.200">
                            <CardBody>
                                <VStack py={12} spacing={4}>
                                    <Icon
                                        icon="solar:users-group-two-rounded-bold-duotone"
                                        width="64"
                                        height="64"
                                        style={{ color: 'var(--chakra-colors-gray-300)' }}
                                    />
                                    <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                        لا يوجد معلمين
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'لا توجد نتائج مطابقة للبحث'
                                            : 'ابدأ بإضافة معلم جديد'}
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    ) : (
                        teachers.map((teacher) => (
                            <TeacherCard
                                key={teacher._id}
                                teacher={teacher}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEdit}
                            />
                        ))
                    )}
                </SimpleGrid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Card borderRadius="xl" border="1px" borderColor="gray.200">
                    <CardBody>
                        <Flex justify="center" align="center" gap={4} flexWrap="wrap">
                            <Button
                                size="sm"
                                isDisabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                leftIcon={<Icon icon="solar:alt-arrow-right-bold-duotone" width="16" height="16" />}
                                fontWeight="medium"
                            >
                                السابق
                            </Button>
                            <HStack spacing={2}>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            size="sm"
                                            colorScheme={page === pageNum ? 'purple' : 'gray'}
                                            variant={page === pageNum ? 'solid' : 'outline'}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </HStack>
                            <Button
                                size="sm"
                                isDisabled={page === totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                rightIcon={<Icon icon="solar:alt-arrow-left-bold-duotone" width="16" height="16" />}
                                fontWeight="medium"
                            >
                                التالي
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>
            )}

            {/* Modals */}
            <TeacherDetailsModal
                teacher={selectedTeacher}
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedTeacher(null);
                }}
                onSuspend={handleSuspend}
                onUnsuspend={handleUnsuspend}
                onEdit={(teacher) => {
                    setShowDetailsModal(false);
                    handleEdit(teacher);
                }}
                onDelete={handleDelete}
                onBlock={(teacherId) => {
                    handleBlock(teacherId);
                    setShowDetailsModal(false);
                }}
                onUnblock={(teacherId) => {
                    handleUnblock(teacherId);
                    setShowDetailsModal(false);
                }}
            />

            <CreateTeacherModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchTeachers}
            />

            <EditTeacherModal
                teacher={selectedTeacher}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedTeacher(null);
                }}
                onSuccess={fetchTeachers}
            />
        </Stack>
    );
}
