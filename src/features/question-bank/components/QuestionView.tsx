import { X, CheckCircle, XCircle, BookOpen, Clock, Award } from 'lucide-react';
import { IQuestionBankResponse, QuestionType, Difficulty } from '@/types/question-bank.types';

interface QuestionViewProps {
  question: IQuestionBankResponse;
  onClose: () => void;
  onEdit: () => void;
}

export default function QuestionView({ question, onEdit, onClose }: QuestionViewProps) {
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
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">تفاصيل السؤال</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question Text */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">السؤال</h3>
            <p className="text-gray-800 text-lg leading-relaxed">{question.question}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">النوع</p>
              <p className="font-semibold text-gray-800">{getQuestionTypeLabel(question.questionType)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">الصعوبة</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                {getDifficultyLabel(question.difficulty)}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">النقاط</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <Award size={16} className="text-yellow-500" />
                {question.points}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">الوقت المقدر</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <Clock size={16} className="text-blue-500" />
                {question.estimatedTime} ثانية
              </p>
            </div>
          </div>

          {/* Answers for MCQ/True-False */}
          {(question.questionType === 'mcq' || question.questionType === 'true_false') && question.answers && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">الإجابات</h3>
              <div className="space-y-2">
                {question.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      answer.isCorrect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {answer.isCorrect ? (
                        <CheckCircle className="text-green-600 shrink-0" size={20} />
                      ) : (
                        <XCircle className="text-gray-400 shrink-0" size={20} />
                      )}
                      <p className={`flex-1 ${answer.isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                        {answer.text}
                      </p>
                      {answer.isCorrect && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                          صحيح
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer for Written */}
          {question.questionType === 'written' && question.correctAnswer && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">الإجابة الصحيحة</h3>
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
                <p className="text-gray-800 leading-relaxed">{question.correctAnswer}</p>
              </div>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">شرح الإجابة</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-gray-800 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          )}

          {/* Course/Lesson */}
          {(question.course || question.lesson) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">الارتباط</h3>
              <div className="space-y-2">
                {question.course && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <BookOpen size={18} className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">الكورس</p>
                      <p className="font-semibold text-gray-800">{question.course.title}</p>
                    </div>
                  </div>
                )}
                {question.lesson && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <BookOpen size={18} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">الدرس</p>
                      <p className="font-semibold text-gray-800">{question.lesson.title}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">الوسوم</h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">عدد مرات الاستخدام</p>
                <p className="text-lg font-bold text-gray-800">{question.usageCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">الحالة</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  question.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {question.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
}

