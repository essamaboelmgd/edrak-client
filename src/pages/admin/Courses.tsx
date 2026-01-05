import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Image,
    Badge,
    Switch,
} from '@chakra-ui/react';
import { coursesService, ICourseAdmin } from '@/features/admin/services/coursesService';
import { teachersService } from '@/features/admin/services/teachersService';
import { getImageUrl } from '@/lib/axios';
import CoursesTable from '@/features/admin/components/CoursesTable';
import SectionsTable from '@/features/admin/components/SectionsTable';
import CourseCard from '@/features/admin/components/CourseCard';
import CourseDetailsModal from '@/features/admin/components/CourseDetailsModal';
import CreateCourseModal from '@/features/admin/components/CreateCourseModal';
import EditCourseModal from '@/features/admin/components/EditCourseModal';
import CreateCourseSectionModal from '@/features/admin/components/CreateCourseSectionModal';

export default function AdminCourses() {
    const toast = useToast();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<ICourseAdmin[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [selectedCourse, setSelectedCourse] = useState<ICourseAdmin | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevFiltersRef = useRef({ searchTerm: '', teacherFilter: 'all', statusFilter: 'all' });

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

    const [sections, setSections] = useState<any[]>([]);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await coursesService.getCoursesWithSections({
                page,
                limit: 20,
                teacher: teacherFilter !== 'all' ? teacherFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });

            if (response.success && response.data) {
                // Filter courses by search term on client side if needed
                let filteredCourses = response.data.courses || [];
                if (searchTerm) {
                    filteredCourses = filteredCourses.filter((course: ICourseAdmin) =>
                        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setCourses(filteredCourses);
                setSections(response.data.sections || []);
                setTotalPages(response.data.totalPages || 1);
                setTotal(response.data.total || 0);
            } else {
                setCourses([]);
                setSections([]);
                setTotalPages(1);
                setTotal(0);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            const axiosError = error as any;
            if (axiosError?.response?.status && axiosError.response.status >= 400) {
                toast({
                    status: 'error',
                    description: 'حدث خطأ أثناء جلب البيانات',
                });
            }
            setCourses([]);
            setSections([]);
            setTotalPages(1);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, teacherFilter, statusFilter, toast]);

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        const filtersChanged =
            prevFiltersRef.current.searchTerm !== searchTerm ||
            prevFiltersRef.current.teacherFilter !== teacherFilter ||
            prevFiltersRef.current.statusFilter !== statusFilter;

        if (filtersChanged && page !== 1) {
            prevFiltersRef.current = { searchTerm, teacherFilter, statusFilter };
            setPage(1);
            return;
        }

        prevFiltersRef.current = { searchTerm, teacherFilter, statusFilter };

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const delay = searchTerm ? 500 : 0;

        const timeoutId = setTimeout(() => {
            fetchCourses();
        }, delay);

        searchTimeoutRef.current = timeoutId;

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [page, searchTerm, teacherFilter, statusFilter, fetchCourses]);

    const handleViewDetails = (course: ICourseAdmin) => {
        navigate(`/admin/courses/${course._id}`);
    };

    const handleEdit = async (course: ICourseAdmin) => {
        try {
            const response = await coursesService.getCourseById(course._id);
            if (response.success && response.data?.course) {
                setSelectedCourse(response.data.course);
                setShowEditModal(true);
                setShowDetailsModal(false);
            } else {
                setSelectedCourse(course);
                setShowEditModal(true);
                setShowDetailsModal(false);
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
            setSelectedCourse(course);
            setShowEditModal(true);
            setShowDetailsModal(false);
        }
    };

    const handleDelete = async (courseId: string) => {
        try {
            await coursesService.deleteCourse(courseId);
            toast({
                status: 'success',
                description: 'تم حذف الكورس بنجاح',
            });
            fetchCourses();
            setShowDetailsModal(false);
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الكورس',
            });
        }
    };

    const handleToggleCourseStatus = async (courseId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'draft' : 'active';
            await coursesService.updateCourse(courseId, { status: newStatus });
            toast({
                status: 'success',
                description: `تم تغيير حالة الكورس إلى ${newStatus === 'active' ? 'نشط' : 'مسودة'}`,
            });
            fetchCourses();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الكورس',
            });
        }
    };

    const handleToggleSectionStatus = async (sectionId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'draft' : 'active';
            // Get section first to update it
            const section = sections.find((s: any) => s._id === sectionId);
            if (section) {
                const formData = new FormData();
                formData.append('status', newStatus);
                // Include other required fields if they exist
                if (section.title) formData.append('title', section.title);
                if (section.description) formData.append('description', section.description || '');
                if (section.educationalLevel) {
                    const eduLevelId = typeof section.educationalLevel === 'string'
                        ? section.educationalLevel
                        : section.educationalLevel._id;
                    if (eduLevelId) formData.append('educationalLevel', eduLevelId);
                }
                // Include poster if it exists (as file path/URL)
                if (section.poster && typeof section.poster === 'string') {
                    formData.append('poster', section.poster);
                }

                await coursesService.updateCourseSection(sectionId, formData);
                toast({
                    status: 'success',
                    description: `تم تغيير حالة القسم إلى ${newStatus === 'active' ? 'نشط' : 'مسودة'}`,
                });
                fetchCourses();
            }
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة القسم',
            });
        }
    };

    const handleReorderSections = async (newSections: any[]) => {
        try {
            // Optimistic update
            setSections(newSections);

            // Prepare payload
            const reorderPayload = newSections.map((section, index) => ({
                sectionId: section._id,
                order: index + 1
            }));

            await coursesService.reorderCourseSections(reorderPayload);

            toast({
                status: 'success',
                description: 'تم تحديث ترتيب الأقسام',
                duration: 2000,
            });
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء إعادة الترتيب',
            });
            fetchCourses(); // Revert
        }
    };

    // Calculate stats
    const stats = {
        total,
        active: courses.filter((c) => c.status === 'active').length,
        draft: courses.filter((c) => c.status === 'draft').length,
        inactive: courses.filter((c) => c.status === 'inactive').length,
        free: courses.filter((c) => c.isFree).length,
        paid: courses.filter((c) => !c.isFree).length,
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
            {/* Modern Hero Header */}
            <Box
                bgGradient="linear(135deg, green.500 0%, green.600 50%, teal.400 100%)"
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
                            <Icon icon="solar:book-bold-duotone" width={24} height={24} />
                            <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                                إدارة المنصة
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                            جميع الكورسات
                        </Text>
                        <Text fontSize="sm" opacity={0.95}>
                            عرض وإدارة {total} كورس على المنصة
                        </Text>
                    </VStack>
                    <HStack spacing={3}>
                        <CreateCourseSectionModal callback={fetchCourses} />
                        <Button
                            bg="white"
                            color="green.600"
                            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                            onClick={() => setShowCreateModal(true)}
                            leftIcon={<Icon icon="solar:book-plus-bold-duotone" width="20" height="20" />}
                            size={{ base: 'md', md: 'lg' }}
                            borderRadius="xl"
                            shadow="md"
                            transition="all 0.3s"
                        >
                            إضافة كورس جديد
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing={{ base: 4, md: 6 }}>
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
                                    إجمالي الكورسات
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {stats.total}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مسجل
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, green.400, green.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:inbox-archive-bold-duotone"
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
                                    كورس نشط
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
                                    مسودة
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                                    {stats.draft}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مسودة
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, orange.400, orange.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:document-bold-duotone"
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
                                    مجاني
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                    {stats.free}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مجاني
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, blue.400, blue.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:gift-bold-duotone"
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
                                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                    {stats.paid}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس مدفوع
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, purple.400, purple.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:dollar-minimalistic-bold-duotone"
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
                                    غير نشط
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                                    {stats.inactive}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    كورس غير نشط
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
                                placeholder="ابحث بالاسم..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg="white"
                                borderRadius="lg"
                            />
                        </InputGroup>

                        <Select
                            value={teacherFilter}
                            onChange={(e) => setTeacherFilter(e.target.value)}
                            bg="white"
                            borderRadius="lg"
                            maxW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">كل المعلمين</option>
                            {teachers.map((teacher) => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.fullName}
                                </option>
                            ))}
                        </Select>

                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            bg="white"
                            borderRadius="lg"
                            maxW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط فقط</option>
                            <option value="draft">مسودة فقط</option>
                            <option value="inactive">غير نشط فقط</option>
                        </Select>

                        <Spacer />

                        <HStack spacing={2}>
                            <Tooltip label="عرض شبكي">
                                <IconButton
                                    aria-label="Grid view"
                                    icon={<Icon icon="solar:widget-5-bold-duotone" width="20" height="20" />}
                                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                                    colorScheme="green"
                                    onClick={() => setViewMode('grid')}
                                />
                            </Tooltip>
                            <Tooltip label="عرض قائمة">
                                <IconButton
                                    aria-label="List view"
                                    icon={<Icon icon="solar:list-bold-duotone" width="20" height="20" />}
                                    variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                    colorScheme="green"
                                    onClick={() => setViewMode('table')}
                                />
                            </Tooltip>
                        </HStack>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setSearchTerm('');
                                setTeacherFilter('all');
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
                    عرض {courses.length} كورس و {sections.length} قسم
                </Text>
                {totalPages > 0 && (
                    <Text fontSize="sm" color="gray.600">
                        صفحة {page} من {totalPages}
                    </Text>
                )}
            </HStack>

            {/* Sections Display */}
            {sections.length > 0 && (
                <Card borderRadius="xl" border="1px" borderColor="gray.200">
                    <CardBody>
                        <Stack spacing={4}>
                            <HStack justify="space-between">
                                <Text fontSize="lg" fontWeight="bold">
                                    الأقسام ({sections.length})
                                </Text>
                            </HStack>
                            {viewMode === 'table' ? (
                                <SectionsTable
                                    sections={sections}
                                    onToggleStatus={handleToggleSectionStatus}
                                    loading={loading}
                                    canReorder={teacherFilter !== 'all' && sections.length > 1}
                                    onReorder={handleReorderSections}
                                />
                            ) : (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                                    {sections.map((section: any) => (
                                        <Card
                                            key={section._id}
                                            borderRadius="xl"
                                            border="1px"
                                            borderColor="gray.200"
                                            bg="white"
                                            transition="all 0.3s"
                                            _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                                            cursor="pointer"
                                            onClick={() => navigate(`/admin/sections/${section._id}`)}
                                        >
                                            <CardBody>
                                                <Stack spacing={3}>
                                                    <Box position="relative">
                                                        {section.poster ? (
                                                            <Image
                                                                src={getImageUrl(section.poster)}
                                                                alt={section.title}
                                                                borderRadius="lg"
                                                                objectFit="cover"
                                                                h="120px"
                                                                w="full"
                                                                fallbackSrc="https://via.placeholder.com/400x200"
                                                            />
                                                        ) : (
                                                            <Box
                                                                h="120px"
                                                                w="full"
                                                                borderRadius="lg"
                                                                bgGradient="linear(to-br, green.400, teal.500)"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                            >
                                                                <Icon
                                                                    icon="solar:book-bold-duotone"
                                                                    width="40"
                                                                    height="40"
                                                                    style={{ color: 'white' }}
                                                                />
                                                            </Box>
                                                        )}
                                                        <HStack
                                                            position="absolute"
                                                            top={2}
                                                            right={2}
                                                            bg="whiteAlpha.900"
                                                            p={1}
                                                            borderRadius="md"
                                                            shadow="sm"
                                                            spacing={2}
                                                        >
                                                            <Switch
                                                                size="sm"
                                                                colorScheme="green"
                                                                isChecked={section.status === 'active'}
                                                                onChange={() => handleToggleSectionStatus(section._id, section.status)}
                                                            />
                                                            <Badge
                                                                colorScheme={section.status === 'active' ? 'green' : 'orange'}
                                                                fontSize="xs"
                                                                px={2}
                                                                py={1}
                                                                borderRadius="full"
                                                            >
                                                                {section.status === 'active' ? 'نشط' : 'مسودة'}
                                                            </Badge>
                                                        </HStack>
                                                    </Box>
                                                    <Box>
                                                        <Text fontSize="md" fontWeight="bold" mb={1} noOfLines={1}>
                                                            {section.title}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                            {section.description || 'لا يوجد وصف'}
                                                        </Text>
                                                    </Box>
                                                    <HStack spacing={2} fontSize="sm" color="gray.500">
                                                        <Icon icon="solar:book-bold-duotone" width="16" height="16" />
                                                        <Text>{section.stats?.totalCourses || 0} كورس</Text>
                                                    </HStack>
                                                </Stack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Stack>
                    </CardBody>
                </Card>
            )}

            {/* Courses Display */}
            <Card borderRadius="xl" border="1px" borderColor="gray.200">
                <CardBody>
                    <Stack spacing={4}>
                        <HStack justify="space-between">
                            <Text fontSize="lg" fontWeight="bold">
                                الكورسات ({courses.length})
                            </Text>
                        </HStack>
                        {viewMode === 'table' ? (
                            <CoursesTable
                                courses={courses}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEdit}
                                onToggleStatus={handleToggleCourseStatus}
                                loading={loading}
                            />
                        ) : (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                                {loading ? (
                                    <Box gridColumn="1 / -1" textAlign="center" py={12}>
                                        <Text color="gray.500">جاري التحميل...</Text>
                                    </Box>
                                ) : courses.length === 0 ? (
                                    <Card borderRadius="xl" border="1px" borderColor="gray.200">
                                        <CardBody>
                                            <VStack py={12} spacing={4}>
                                                <Icon
                                                    icon="solar:inbox-line-bold-duotone"
                                                    width="64"
                                                    height="64"
                                                    style={{ color: 'var(--chakra-colors-gray-300)' }}
                                                />
                                                <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                                    لا توجد كورسات
                                                </Text>
                                                <Text fontSize="sm" color="gray.400">
                                                    {searchTerm || teacherFilter !== 'all' || statusFilter !== 'all'
                                                        ? 'لا توجد نتائج مطابقة للبحث'
                                                        : 'ابدأ بإضافة كورس جديد'}
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ) : (
                                    courses.map((course) => (
                                        <CourseCard
                                            key={course._id}
                                            course={course}
                                            onViewDetails={handleViewDetails}
                                            onEdit={handleEdit}
                                            onToggleStatus={handleToggleCourseStatus}
                                        />
                                    ))
                                )}
                            </SimpleGrid>
                        )}
                    </Stack>
                </CardBody>
            </Card>

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
                                            colorScheme={page === pageNum ? 'green' : 'gray'}
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
            <CourseDetailsModal
                course={selectedCourse}
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedCourse(null);
                }}
                onEdit={(course) => {
                    setShowDetailsModal(false);
                    handleEdit(course);
                }}
                onDelete={handleDelete}
            />

            <CreateCourseModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchCourses}
            />

            <EditCourseModal
                course={selectedCourse}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedCourse(null);
                }}
                onSuccess={fetchCourses}
            />
        </Stack>
    );
}
