import { useState, useEffect, useCallback, useRef } from 'react';
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
import { lessonsService, ILessonAdmin } from '@/features/admin/services/lessonsService';
import { coursesService } from '@/features/admin/services/coursesService';
import { teachersService } from '@/features/admin/services/teachersService';
import { axiosInstance } from '@/lib/axios';
import LessonsTable from '@/features/admin/components/LessonsTable';
import LessonCard from '@/features/admin/components/LessonCard';
import CreateLessonModal from '@/features/admin/components/CreateLessonModal';

export default function AdminLessons() {
    const toast = useToast();
    const [lessons, setLessons] = useState<ILessonAdmin[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [educationalLevelFilter, setEducationalLevelFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevFiltersRef = useRef({ searchTerm: '', teacherFilter: 'all', courseFilter: 'all', educationalLevelFilter: 'all', statusFilter: 'all' });

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

    const fetchCourses = async () => {
        try {
            const response = await coursesService.getAllCourses({ limit: 1000 });
            if (response.success && response.data) {
                setCourses(response.data.courses || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchEducationalLevels = async () => {
        try {
            const response = await axiosInstance.get('/educational-levels');
            const educationalLevelsData = response.data?.data?.educationalLevels;
            let levels: any[] = [];

            if (educationalLevelsData) {
                if (educationalLevelsData.primary) {
                    levels = [...levels, ...educationalLevelsData.primary];
                }
                if (educationalLevelsData.preparatory) {
                    levels = [...levels, ...educationalLevelsData.preparatory];
                }
                if (educationalLevelsData.secondary) {
                    levels = [...levels, ...educationalLevelsData.secondary];
                }
            } else {
                levels = response.data?.data?.educationalLevels ||
                    response.data?.data ||
                    response.data?.educationalLevels ||
                    response.data || [];
                levels = Array.isArray(levels) ? levels : [];
            }

            setEducationalLevels(levels);
        } catch (error) {
            console.error('Failed to fetch educational levels:', error);
            setEducationalLevels([]);
        }
    };

    const fetchLessons = useCallback(async () => {
        try {
            setLoading(true);
            const response = await lessonsService.getAllLessons({
                page,
                limit: 20,
                course: courseFilter !== 'all' ? courseFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });

            if (response.success && response.data) {
                let filteredLessons = response.data.lessons || [];

                // Client-side filtering for search, teacher, and educational level
                if (searchTerm) {
                    filteredLessons = filteredLessons.filter((lesson: ILessonAdmin) =>
                        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                if (teacherFilter !== 'all') {
                    filteredLessons = filteredLessons.filter((lesson: ILessonAdmin) =>
                        lesson.course?.teacher?._id === teacherFilter
                    );
                }

                if (educationalLevelFilter !== 'all') {
                    filteredLessons = filteredLessons.filter((lesson: ILessonAdmin) =>
                        lesson.course?.educationalLevel?._id === educationalLevelFilter
                    );
                }

                setLessons(filteredLessons);
                setTotalPages(response.data.totalPages || 1);
                setTotal(response.data.total || 0);
            } else {
                setLessons([]);
                setTotalPages(1);
                setTotal(0);
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
            const axiosError = error as any;
            if (axiosError?.response?.status && axiosError.response.status >= 400) {
                toast({
                    status: 'error',
                    description: 'حدث خطأ أثناء جلب البيانات',
                });
            }
            setLessons([]);
            setTotalPages(1);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, teacherFilter, courseFilter, educationalLevelFilter, statusFilter, toast]);

    useEffect(() => {
        fetchTeachers();
        fetchCourses();
        fetchEducationalLevels();
    }, []);

    useEffect(() => {
        const filtersChanged =
            prevFiltersRef.current.searchTerm !== searchTerm ||
            prevFiltersRef.current.teacherFilter !== teacherFilter ||
            prevFiltersRef.current.courseFilter !== courseFilter ||
            prevFiltersRef.current.educationalLevelFilter !== educationalLevelFilter ||
            prevFiltersRef.current.statusFilter !== statusFilter;

        if (filtersChanged && page !== 1) {
            prevFiltersRef.current = { searchTerm, teacherFilter, courseFilter, educationalLevelFilter, statusFilter };
            setPage(1);
            return;
        }

        prevFiltersRef.current = { searchTerm, teacherFilter, courseFilter, educationalLevelFilter, statusFilter };

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const delay = searchTerm ? 500 : 0;

        const timeoutId = setTimeout(() => {
            fetchLessons();
        }, delay);

        searchTimeoutRef.current = timeoutId;

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [page, searchTerm, teacherFilter, courseFilter, educationalLevelFilter, statusFilter, fetchLessons]);

    const handleToggleLessonStatus = async (lessonId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'draft' : 'active';
            await lessonsService.updateLessonStatus(lessonId, newStatus);
            toast({
                status: 'success',
                description: `تم تغيير حالة الدرس إلى ${newStatus === 'active' ? 'نشط' : 'مسودة'}`,
            });
            fetchLessons();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الدرس',
            });
        }
    };

    const handleDelete = async (lessonId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

        try {
            await lessonsService.deleteLesson(lessonId);
            toast({
                status: 'success',
                description: 'تم حذف الدرس بنجاح',
            });
            fetchLessons();
        } catch (error: any) {
            toast({
                status: 'error',
                description: error.response?.data?.message || 'حدث خطأ أثناء حذف الدرس',
            });
        }
    };

    // Calculate stats
    const stats = {
        total,
        active: lessons.filter((l) => l.status === 'active').length,
        draft: lessons.filter((l) => l.status === 'draft').length,
        free: lessons.filter((l) => l.isFree).length,
        paid: lessons.filter((l) => !l.isFree).length,
    };

    return (
        <Stack p={{ base: 4, md: 6 }} spacing={{ base: 4, md: 6 }} dir="rtl">
            {/* Modern Hero Header */}
            <Box
                bgGradient="linear(135deg, teal.500 0%, cyan.500 50%, blue.400 100%)"
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
                            <Icon icon="solar:play-circle-bold-duotone" width={24} height={24} />
                            <Text fontSize="xs" opacity={0.9} fontWeight="medium">
                                إدارة المنصة
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                            جميع الدروس
                        </Text>
                        <Text fontSize="sm" opacity={0.95}>
                            عرض وإدارة {total} درس على المنصة
                        </Text>
                    </VStack>
                    <CreateLessonModal
                        callback={fetchLessons}
                        trigger={
                            <Button
                                bg="white"
                                color="teal.600"
                                _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'lg' }}
                                leftIcon={<Icon icon="solar:play-circle-bold-duotone" width="20" height="20" />}
                                size={{ base: 'md', md: 'lg' }}
                                borderRadius="xl"
                                shadow="md"
                                transition="all 0.3s"
                            >
                                إضافة درس جديد
                            </Button>
                        }
                    />
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
                                    إجمالي الدروس
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {stats.total}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    درس مسجل
                                </Text>
                            </VStack>
                            <Box
                                p={4}
                                borderRadius="xl"
                                bgGradient="linear(135deg, teal.400, teal.600)"
                                shadow="md"
                            >
                                <Icon
                                    icon="solar:play-circle-bold-duotone"
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
                                    درس نشط
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
                                    درس مسودة
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
                                    درس مجاني
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
                                    درس مدفوع
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
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            bg="white"
                            borderRadius="lg"
                            maxW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">كل الكورسات</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.title}
                                </option>
                            ))}
                        </Select>

                        <Select
                            value={educationalLevelFilter}
                            onChange={(e) => setEducationalLevelFilter(e.target.value)}
                            bg="white"
                            borderRadius="lg"
                            maxW={{ base: '100%', md: '200px' }}
                        >
                            <option value="all">كل المراحل</option>
                            {educationalLevels.map((level) => (
                                <option key={level._id} value={level._id}>
                                    {level.name || level.shortName}
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
                        </Select>

                        <Spacer />

                        <HStack spacing={2}>
                            <Tooltip label="عرض شبكي">
                                <IconButton
                                    aria-label="Grid view"
                                    icon={<Icon icon="solar:widget-5-bold-duotone" width="20" height="20" />}
                                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                                    colorScheme="teal"
                                    onClick={() => setViewMode('grid')}
                                />
                            </Tooltip>
                            <Tooltip label="عرض قائمة">
                                <IconButton
                                    aria-label="List view"
                                    icon={<Icon icon="solar:list-bold-duotone" width="20" height="20" />}
                                    variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                    colorScheme="teal"
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
                                setCourseFilter('all');
                                setEducationalLevelFilter('all');
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
                    عرض {lessons.length} من {total} درس
                </Text>
                {totalPages > 0 && (
                    <Text fontSize="sm" color="gray.600">
                        صفحة {page} من {totalPages}
                    </Text>
                )}
            </HStack>

            {/* Content */}
            {viewMode === 'table' ? (
                <LessonsTable
                    lessons={lessons}
                    onToggleStatus={handleToggleLessonStatus}
                    onDelete={handleDelete}
                    loading={loading}
                />
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                    {loading ? (
                        <Box gridColumn="1 / -1" textAlign="center" py={12}>
                            <Text color="gray.500">جاري التحميل...</Text>
                        </Box>
                    ) : lessons.length === 0 ? (
                        <Card borderRadius="xl" border="1px" borderColor="gray.200">
                            <CardBody>
                                <VStack py={12} spacing={4}>
                                    <Icon
                                        icon="solar:play-circle-line-bold-duotone"
                                        width="64"
                                        height="64"
                                        style={{ color: 'var(--chakra-colors-gray-300)' }}
                                    />
                                    <Text fontSize="lg" color="gray.500" fontWeight="medium">
                                        لا توجد دروس
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        {searchTerm || teacherFilter !== 'all' || courseFilter !== 'all' || educationalLevelFilter !== 'all' || statusFilter !== 'all'
                                            ? 'لا توجد نتائج مطابقة للبحث'
                                            : 'ابدأ بإضافة درس جديد'}
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    ) : (
                        lessons.map((lesson) => (
                            <LessonCard
                                key={lesson._id}
                                lesson={lesson}
                                onToggleStatus={handleToggleLessonStatus}
                                onDelete={handleDelete}
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
                                            colorScheme={page === pageNum ? 'teal' : 'gray'}
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
        </Stack>
    );
}

