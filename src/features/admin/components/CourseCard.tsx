import { motion } from 'framer-motion';
import { Users, BookOpen, Coins } from 'lucide-react';
import { ICourseAdmin } from '../services/coursesService';
import { getImageUrl } from '@/lib/axios';

interface CourseCardProps {
  course: ICourseAdmin;
  onViewDetails?: (course: ICourseAdmin) => void;
  onEdit?: (course: ICourseAdmin) => void;
  onToggleStatus?: (courseId: string, currentStatus: string) => void;
}

export default function CourseCard({ course, onViewDetails, onEdit, onToggleStatus }: CourseCardProps) {
  const getStatusBadge = () => {
    if (course.status === 'active' || course.status === 'published') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          نشط
        </span>
      );
    }
    if (course.status === 'draft') {
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
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
    >
      {/* Image */}
      <div className="h-40 relative">
        {course.poster || course.thumbnail ? (
          <img
            src={getImageUrl(course.poster || course.thumbnail!)}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <BookOpen className="text-white" size={40} />
          </div>
        )}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          {onToggleStatus && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={course.status === 'active'}
                onChange={() => onToggleStatus(course._id, course.status)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Course Info */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{course.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {course.description || 'لا يوجد وصف'}
          </p>
        </div>

        {/* Teacher Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800 mb-1">المدرس:</p>
          <p className="text-sm text-gray-600">{course.teacher.fullName}</p>
          <p className="text-xs text-gray-500">{course.teacher.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Users size={16} />
            </div>
            <p className="text-lg font-bold text-gray-800">{course.stats.totalStudents}</p>
            <p className="text-xs text-gray-500">طالب</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <BookOpen size={16} />
            </div>
            <p className="text-lg font-bold text-gray-800">{course.stats.totalLessons}</p>
            <p className="text-xs text-gray-500">درس</p>
          </div>
          <div className="text-center">
            {course.isFree ? (
              <>
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <BookOpen size={16} />
                </div>
                <p className="text-lg font-bold text-blue-600">مجاني</p>
                <p className="text-xs text-gray-500">كورس مجاني</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Coins size={16} />
                </div>
                <p className="text-lg font-bold text-green-600">
                  {course.finalPrice.toLocaleString()}
                </p>
                <p className="text-xs font-semibold text-green-600">ج.م</p>
              </>
            )}
          </div>
        </div>

        {/* Educational Level */}
        <div className="mb-4">
          <span className="text-xs text-gray-500">المرحلة: </span>
          <span className="text-xs font-medium text-gray-700">
            {course.educationalLevel.name || course.educationalLevel.shortName}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(course)}
            className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            عرض التفاصيل
          </button>
          <button
            onClick={() => onEdit?.(course)}
            className="py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            تعديل
          </button>
        </div>
      </div>
    </motion.div>
  );
}

