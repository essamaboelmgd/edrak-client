import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QuestionList from '@/features/question-bank/components/QuestionList';
import QuestionForm from '@/features/question-bank/components/QuestionForm';
import QuestionView from '@/features/question-bank/components/QuestionView';
import questionBankService from '@/features/question-bank/questionBankService';
import {
  IQuestionBankResponse,
  ICreateQuestionBankRequest,
  IUpdateQuestionBankRequest,
  IGetQuestionBankQuery,
} from '@/types/question-bank.types';
import { BarChart2, BookOpen, Plus } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function QuestionBank() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuestion, setSelectedQuestion] = useState<IQuestionBankResponse | null>(null);
  const [filters, setFilters] = useState<IGetQuestionBankQuery>({
    page: 1,
    limit: 20,
    activeOnly: true,
  });

  const queryClient = useQueryClient();

  // Fetch questions
  const { data, isLoading, error } = useQuery({
    queryKey: ['questionBank', filters],
    queryFn: () => questionBankService.getAllQuestions(filters),
  });

  // Fetch statistics (with error handling)
  // NOTE: Backend route `/exams/question-bank/statistics` must be defined BEFORE `/exams/question-bank/:id`
  // Otherwise "statistics" will be treated as an ID parameter
  const { data: stats, error: statsError } = useQuery({
    queryKey: ['questionBankStats'],
    queryFn: () => questionBankService.getQuestionStatistics(),
    retry: false, // Don't retry if it fails
    enabled: true, // Still try to fetch, but handle errors gracefully
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ICreateQuestionBankRequest) => questionBankService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      queryClient.invalidateQueries({ queryKey: ['questionBankStats'] });
      setViewMode('list');
      alert('تم إنشاء السؤال بنجاح');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'حدث خطأ أثناء إنشاء السؤال');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateQuestionBankRequest }) =>
      questionBankService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      queryClient.invalidateQueries({ queryKey: ['questionBankStats'] });
      setViewMode('list');
      setSelectedQuestion(null);
      alert('تم تحديث السؤال بنجاح');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'حدث خطأ أثناء تحديث السؤال');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionBankService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBank'] });
      queryClient.invalidateQueries({ queryKey: ['questionBankStats'] });
      alert('تم حذف السؤال بنجاح');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'حدث خطأ أثناء حذف السؤال');
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
      <div className="space-y-6" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {viewMode === 'create' ? 'إنشاء سؤال جديد' : 'تعديل السؤال'}
          </h1>
          <QuestionForm
            question={viewMode === 'edit' ? selectedQuestion || undefined : undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </div>
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
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">بنك الأسئلة</h1>
          <p className="text-gray-500 mt-1">إدارة وإنشاء الأسئلة الخاصة بك</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus size={18} />
          <span>سؤال جديد</span>
        </button>
      </div>

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
        />
      </div>

      {/* Pagination */}
      {data?.data && data.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            disabled={filters.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            السابق
          </button>
          <span className="px-4 py-2 text-gray-700">
            صفحة {filters.page} من {data.data.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={filters.page === data.data.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

