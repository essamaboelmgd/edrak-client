import { motion } from 'framer-motion';
import { BookOpen, Users, Coins, Edit, Eye, MoreVertical } from 'lucide-react';
import { ICourseAdmin } from '../services/coursesService';
import { getImageUrl } from '@/lib/axios';

interface CoursesTableProps {
  courses: ICourseAdmin[];
  onViewDetails?: (course: ICourseAdmin) => void;
  onEdit?: (course: ICourseAdmin) => void;
  loading?: boolean;
}

export default function CoursesTable({ courses, onViewDetails, onEdit, loading }: CoursesTableProps) {
  const getStatusBadge = (course: ICourseAdmin) => {
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="text-center text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="text-center text-gray-500">لا يوجد كورسات</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الكورس</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المدرس</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المرحلة</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الطلاب</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الدروس</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">السعر</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course, idx) => (
              <motion.tr
                key={course._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {course.poster || course.thumbnail ? (
                      <img
                        src={getImageUrl(course.poster || course.thumbnail!)}
                        alt={course.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <BookOpen className="text-white" size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{course.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {course.description || 'لا يوجد وصف'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{course.teacher.fullName}</p>
                    <p className="text-sm text-gray-500">{course.teacher.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">
                    {course.educationalLevel.name || course.educationalLevel.shortName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(course)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={16} />
                    <span className="font-medium">{course.stats.totalStudents}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen size={16} />
                    <span className="font-medium">{course.stats.totalLessons}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {course.isFree ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        مجاني
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <Coins size={16} className="text-green-600" />
                        <span className="font-bold text-green-700">
                          {course.finalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-green-600">ج.م</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails?.(course)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit?.(course)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

