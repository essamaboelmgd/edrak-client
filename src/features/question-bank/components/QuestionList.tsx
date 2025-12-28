import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Edit, Trash2, Eye, BookOpen, FileText, CheckCircle, XCircle, User } from 'lucide-react';
import { IQuestionBankResponse, QuestionType, Difficulty } from '@/types/question-bank.types';

interface QuestionListProps {
  questions: IQuestionBankResponse[];
  isLoading?: boolean;
  onEdit: (question: IQuestionBankResponse) => void;
  onDelete: (id: string) => void;
  onView: (question: IQuestionBankResponse) => void;
  onCreateNew: () => void;
  showTeacher?: boolean; // For admin view
}

export default function QuestionList({
  questions,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onCreateNew,
  showTeacher = false,
}: QuestionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || q.questionType === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'mcq': return 'اختيار من متعدد';
      case 'true_false': return 'صحيح/خطأ';
      case 'written': return 'سؤال كتابي';
      default: return type;
    }
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">بنك الأسئلة</h2>
          <p className="text-gray-500 mt-1">إجمالي الأسئلة: {questions.length}</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus size={18} />
          <span>سؤال جديد</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن سؤال..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Filter size={18} />
          <span>فلتر</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-4 rounded-xl border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">نوع السؤال</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as QuestionType | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">الكل</option>
                <option value="mcq">اختيار من متعدد</option>
                <option value="true_false">صحيح/خطأ</option>
                <option value="written">سؤال كتابي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">مستوى الصعوبة</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">الكل</option>
                <option value="easy">سهل</option>
                <option value="medium">متوسط</option>
                <option value="hard">صعب</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Questions Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">لا توجد أسئلة</p>
          <button
            onClick={onCreateNew}
            className="mt-4 px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            إنشاء سؤال جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question) => (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {question.question}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {question.questionType === 'mcq' && <FileText size={16} className="text-blue-500" />}
                      {question.questionType === 'true_false' && <CheckCircle size={16} className="text-green-500" />}
                      {question.questionType === 'written' && <BookOpen size={16} className="text-purple-500" />}
                      <span className="text-sm text-gray-600">{getQuestionTypeLabel(question.questionType)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                    {getDifficultyLabel(question.difficulty)}
                  </span>
                </div>

                {/* Teacher Info - For admin view */}
                {showTeacher && question.teacher && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">المدرس:</span>{' '}
                        {question.teacher.firstName} {question.teacher.middleName} {question.teacher.lastName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Course/Lesson Info */}
                {question.course && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">الكورس:</span> {question.course.title}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{question.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
                  <span>{question.points} نقطة</span>
                  <span>{question.estimatedTime} ثانية</span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {question.usageCount} استخدام
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {question.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={14} />
                        نشط
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-sm">
                        <XCircle size={14} />
                        غير نشط
                      </span>
                    )}
                    {question.isGeneral && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                        عام
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(question)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    <span>عرض</span>
                  </button>
                  <button
                    onClick={() => onEdit(question)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Edit size={16} />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => onDelete(question._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

