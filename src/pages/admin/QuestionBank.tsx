import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast, HStack, VStack, Input, InputGroup, InputLeftElement, Select, Button, Text } from '@chakra-ui/react';
import { Search, Plus } from 'lucide-react';
import QuestionList from '@/features/question-bank/components/QuestionList';
import AdminQuestionForm from '@/features/admin/components/AdminQuestionForm';
import QuestionView from '@/features/question-bank/components/QuestionView';
import questionBankService from '@/features/question-bank/questionBankService';
import { teachersService } from '@/features/admin/services/teachersService';
import {
  IQuestionBankResponse,
  ICreateQuestionBankRequest,
  IUpdateQuestionBankRequest,
  IGetQuestionBankQuery,
} from '@/types/question-bank.types';
import { BarChart2, BookOpen } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function AdminQuestionBank() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuestion, setSelectedQuestion] = useState<IQuestionBankResponse | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filters, setFilters] = useState<IGetQuestionBankQuery>({
    page: 1,
    limit: 20,
    activeOnly: false, // Admin can see all questions
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFiltersRef = useRef({ searchTerm: '', teacherFilter: 'all' });

  const queryClient = useQueryClient();

  // Fetch teachers
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

  // Fetch questions
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminQuestionBank', filters],
    queryFn: () => questionBankService.getAllQuestions(filters),
  });

  // Fetch statistics
  const { data: stats, error: statsError } = useQuery({
    queryKey: ['adminQuestionBankStats', teacherFilter],
    queryFn: () => questionBankService.getQuestionStatistics(teacherFilter !== 'all' ? teacherFilter : undefined),
    retry: false,
    enabled: true,
  });

  // Update filters when search or teacher filter changes
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.searchTerm !== searchTerm ||
      prevFiltersRef.current.teacherFilter !== teacherFilter;

    if (filtersChanged && filters.page !== 1) {
      prevFiltersRef.current = { searchTerm, teacherFilter };
      setFilters({ ...filters, page: 1 });
      return;
    }

    prevFiltersRef.current = { searchTerm, teacherFilter };

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const delay = searchTerm ? 500 : 0;

    const timeoutId = setTimeout(() => {
      setFilters({
        ...filters,
        page: filtersChanged && filters.page !== 1 ? 1 : filters.page,
        search: searchTerm || undefined,
        teacher: teacherFilter !== 'all' ? teacherFilter : undefined,
      });
    }, delay);

    searchTimeoutRef.current = timeoutId;

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, teacherFilter, filters]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ICreateQuestionBankRequest) => questionBankService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBank'] });
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBankStats'] });
      setViewMode('list');
      toast({
        status: 'success',
        description: 'تم إنشاء السؤال بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء السؤال',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateQuestionBankRequest }) =>
      questionBankService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBank'] });
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBankStats'] });
      setViewMode('list');
      setSelectedQuestion(null);
      toast({
        status: 'success',
        description: 'تم تحديث السؤال بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء تحديث السؤال',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionBankService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBank'] });
      queryClient.invalidateQueries({ queryKey: ['adminQuestionBankStats'] });
      toast({
        status: 'success',
        description: 'تم حذف السؤال بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        status: 'error',
        description: error.response?.data?.message || 'حدث خطأ أثناء حذف السؤال',
      });
    },
  });

  const handleCreate = () => {
    setSelectedQuestion(null);
    setViewMode('create');
  };

  const handleEdit = (question: IQuestionBankResponse) => {
    setSelectedQuestion(question);
    setViewMode('edit');
  };

  const handleView = (question: IQuestionBankResponse) => {
    setSelectedQuestion(question);
    setViewMode('view');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = async (data: ICreateQuestionBankRequest | IUpdateQuestionBankRequest) => {
    if (viewMode === 'create') {
      await createMutation.mutateAsync(data as ICreateQuestionBankRequest);
    } else if (viewMode === 'edit' && selectedQuestion) {
      await updateMutation.mutateAsync({ id: selectedQuestion._id, data });
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedQuestion(null);
  };

  const statistics = stats?.data?.statistics;

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <VStack spacing={6} align="stretch" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {viewMode === 'create' ? 'إنشاء سؤال جديد' : 'تعديل السؤال'}
          </h1>
          <AdminQuestionForm
            question={viewMode === 'edit' ? selectedQuestion || undefined : undefined}
            teachers={teachers}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </VStack>
    );
  }

  if (viewMode === 'view' && selectedQuestion) {
    return (
      <QuestionView
        question={selectedQuestion}
        onClose={handleCancel}
        onEdit={() => handleEdit(selectedQuestion)}
      />
    );
  }

  return (
    <VStack spacing={6} align="stretch" dir="rtl">
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            بنك الأسئلة
          </Text>
          <Text color="gray.500">
            إدارة جميع أسئلة المدرسين ({data?.data?.total || 0} سؤال)
          </Text>
        </VStack>
        <Button
          leftIcon={<Plus size={18} />}
          bgGradient="linear(to-r, red.600, orange.600)"
          color="white"
          _hover={{ bgGradient: 'linear(to-r, red.700, orange.700)' }}
          shadow="lg"
          onClick={handleCreate}
        >
          سؤال جديد
        </Button>
      </HStack>

      {/* Search and Filters */}
      <HStack spacing={4} flexWrap="wrap">
        <InputGroup flex="1" minW="200px">
          <InputLeftElement pointerEvents="none">
            <Search size={20} color="#9CA3AF" />
          </InputLeftElement>
          <Input
            placeholder="ابحث عن سؤال..."
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
      </HStack>

      {/* Statistics Cards */}
      {statistics && !statsError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">إجمالي الأسئلة</h3>
            <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">الأسئلة النشطة</h3>
            <p className="text-2xl font-bold text-gray-800">{statistics.active}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">الأسئلة العامة</h3>
            <p className="text-2xl font-bold text-gray-800">{statistics.general}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <BarChart2 className="text-orange-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">الأسئلة المرتبطة</h3>
            <p className="text-2xl font-bold text-gray-800">{statistics.courseSpecific}</p>
          </motion.div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            حدث خطأ أثناء جلب الأسئلة
          </div>
        )}
        <QuestionList
          questions={data?.data?.questions || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreateNew={handleCreate}
          showTeacher={true}
        />
      </div>

      {/* Pagination */}
      {data?.data && data.data.totalPages > 1 && (
        <HStack justify="center" spacing={2}>
          <Button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            disabled={filters.page === 1}
            variant="outline"
            size="sm"
          >
            السابق
          </Button>
          <Text px={4} py={2} color="gray.700">
            صفحة {filters.page} من {data.data.totalPages}
          </Text>
          <Button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={filters.page === data.data.totalPages}
            variant="outline"
            size="sm"
          >
            التالي
          </Button>
        </HStack>
      )}
    </VStack>
  );
}

