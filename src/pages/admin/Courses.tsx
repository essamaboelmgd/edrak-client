import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Grid, List } from 'lucide-react';
import { useToast, HStack, VStack, Input, InputGroup, InputLeftElement, Select, Button, Text } from '@chakra-ui/react';
import { coursesService, ICourseAdmin } from '@/features/admin/services/coursesService';
import { teachersService } from '@/features/admin/services/teachersService';
import CoursesTable from '@/features/admin/components/CoursesTable';
import CourseCard from '@/features/admin/components/CourseCard';
import CourseDetailsModal from '@/features/admin/components/CourseDetailsModal';
import CreateCourseModal from '@/features/admin/components/CreateCourseModal';
import EditCourseModal from '@/features/admin/components/EditCourseModal';
import CreateCourseSectionModal from '@/features/admin/components/CreateCourseSectionModal';

export default function AdminCourses() {
  const toast = useToast();
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

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await coursesService.getAllCourses({
        page,
        limit: 20,
        search: searchTerm || undefined,
        teacher: teacherFilter !== 'all' ? teacherFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (response.success && response.data) {
        setCourses(response.data.courses || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      } else {
        setCourses([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Only show error if it's actually an error, not a successful response
      const axiosError = error as any;
      if (axiosError?.response?.status && axiosError.response.status >= 400) {
        toast({
          status: 'error',
          description: 'حدث خطأ أثناء جلب البيانات',
        });
      }
      setCourses([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, teacherFilter, statusFilter, toast]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Single useEffect to handle all dependencies with debouncing for search
  useEffect(() => {
    // Check if filters changed (not page)
    const filtersChanged = 
      prevFiltersRef.current.searchTerm !== searchTerm ||
      prevFiltersRef.current.teacherFilter !== teacherFilter ||
      prevFiltersRef.current.statusFilter !== statusFilter;

    // If filters changed and we're not on page 1, reset page first
    if (filtersChanged && page !== 1) {
      prevFiltersRef.current = { searchTerm, teacherFilter, statusFilter };
      setPage(1);
      return; // Don't fetch yet, wait for page to reset
    }

    // Update previous filters
    prevFiltersRef.current = { searchTerm, teacherFilter, statusFilter };

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // For search, debounce; for other filters, fetch immediately
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
    setSelectedCourse(course);
    setShowDetailsModal(true);
    setShowEditModal(false);
  };

  const handleEdit = async (course: ICourseAdmin) => {
    try {
      // Fetch full course details to ensure all fields are available
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

  return (
    <VStack spacing={6} align="stretch" dir="rtl">
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            إدارة الكورسات
          </Text>
          <Text color="gray.500">
            عرض وإدارة جميع الكورسات في النظام ({total} كورس)
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            leftIcon={viewMode === 'table' ? <Grid size={18} /> : <List size={18} />}
            variant="outline"
          >
            {viewMode === 'table' ? 'عرض شبكي' : 'عرض جدول'}
          </Button>
          <CreateCourseSectionModal callback={fetchCourses} />
          <Button
            leftIcon={<Plus size={18} />}
            bgGradient="linear(to-r, red.600, orange.600)"
            color="white"
            _hover={{ bgGradient: 'linear(to-r, red.700, orange.700)' }}
            shadow="lg"
            onClick={() => setShowCreateModal(true)}
          >
            كورس جديد
          </Button>
        </HStack>
      </HStack>

      {/* Search and Filters */}
      <HStack spacing={4} flexWrap="wrap">
        <InputGroup flex="1" minW="200px">
          <InputLeftElement pointerEvents="none">
            <Search size={20} color="#9CA3AF" />
          </InputLeftElement>
          <Input
            placeholder="ابحث عن كورس بالعنوان أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Select
          w="200px"
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
        >
          <option value="all">جميع المدرسين</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.fullName}
            </option>
          ))}
        </Select>
        <Select
          w="200px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="draft">مسودة</option>
          <option value="inactive">معطل</option>
        </Select>
      </HStack>

      {/* Content */}
      {viewMode === 'table' ? (
        <CoursesTable
          courses={courses}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-12">جاري التحميل...</div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">لا يوجد كورسات</div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="center" spacing={2}>
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            السابق
          </Button>
          <Text px={4} py={2} color="gray.700">
            صفحة {page} من {totalPages}
          </Text>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            التالي
          </Button>
        </HStack>
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
    </VStack>
  );
}

