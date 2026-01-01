import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, DollarSign, Gift } from 'lucide-react';
import { ILessonAdmin } from '../services/lessonsService';
import { getImageUrl } from '@/lib/axios';

interface LessonCardProps {
  lesson: ILessonAdmin;
  onToggleStatus?: (lessonId: string, currentStatus: string) => void;
  onDelete?: (lessonId: string) => void;
}

export default function LessonCard({ lesson, onToggleStatus, onDelete: _onDelete }: LessonCardProps) {
  const navigate = useNavigate();
  const getStatusBadge = () => {
    if (lesson.status === 'active' || lesson.status === 'published') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          نشط
        </span>
      );
    }
    if (lesson.status === 'draft') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          مسودة
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        معطل
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
      onClick={() => navigate(`/admin/lessons/${lesson._id}`)}
    >
      {/* Image */}
      <div className="h-40 relative">
        {lesson.poster || lesson.thumbnail ? (
          <img
            src={getImageUrl(lesson.poster || lesson.thumbnail!)}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <PlayCircle className="text-white" size={40} />
          </div>
        )}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          {onToggleStatus && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={lesson.status === 'active'}
                onChange={() => onToggleStatus(lesson._id, lesson.status)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Lesson Info */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{lesson.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {lesson.description || 'لا يوجد وصف'}
          </p>
        </div>

        {/* Course Info */}
        {lesson.course && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-800 mb-1">الكورس:</p>
            <p className="text-sm text-gray-600">{lesson.course.title}</p>
          </div>
        )}

        {/* Teacher Info */}
        {lesson.course?.teacher && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-800 mb-1">المدرس:</p>
            <p className="text-sm text-gray-600">{lesson.course.teacher.fullName}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Clock size={16} />
            </div>
            <p className="text-lg font-bold text-gray-800">{lesson.duration || 0}</p>
            <p className="text-xs text-gray-500">دقيقة</p>
          </div>
          <div className="text-center">
            {lesson.isFree ? (
              <>
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Gift size={16} />
                </div>
                <p className="text-lg font-bold text-blue-600">مجاني</p>
                <p className="text-xs text-gray-500">درس مجاني</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <DollarSign size={16} />
                </div>
                <p className="text-lg font-bold text-green-600">
                  {lesson.finalPrice?.toLocaleString() || lesson.price?.toLocaleString() || 0}
                </p>
                <p className="text-xs font-semibold text-green-600">ج.م</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 px-4 bg-teal-50 text-teal-600 rounded-lg font-medium hover:bg-teal-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/lessons/${lesson._id}`);
            }}
          >
            عرض التفاصيل
          </button>
          <button
            className="py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            تعديل
          </button>
        </div>
      </div>
    </motion.div>
  );
}

