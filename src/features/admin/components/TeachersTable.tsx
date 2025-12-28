import { motion } from 'framer-motion';
import { Users, BookOpen, Coins, MoreVertical, Edit, Eye, Crown, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ITeacherAdmin } from '../services/teachersService';

interface TeachersTableProps {
  teachers: ITeacherAdmin[];
  onViewDetails?: (teacher: ITeacherAdmin) => void;
  onEdit?: (teacher: ITeacherAdmin) => void;
  loading?: boolean;
}

export default function TeachersTable({ teachers, onViewDetails, onEdit, loading }: TeachersTableProps) {
  const getStatusBadge = (teacher: ITeacherAdmin) => {
    const isInTrial = teacher.trial?.isInTrial || teacher.platformStatus === 'trial';
    const hasActiveSubscription = teacher.subscription?.isActive && !isInTrial;
    const isSuspended = teacher.platformStatus === 'suspended';
    const isExpired = teacher.platformStatus === 'expired';

    if (isSuspended) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1 w-fit">
          <XCircle size={12} />
          معطل
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
          <Clock size={12} />
          منتهي
        </span>
      );
    }
    if (isInTrial) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
          <Clock size={12} />
          تجريبي
        </span>
      );
    }
    if (hasActiveSubscription) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
          <CheckCircle2 size={12} />
          نشط
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 w-fit">
        غير نشط
      </span>
    );
  };

  const getPlanName = (teacher: ITeacherAdmin) => {
    if (teacher.trial?.isInTrial || teacher.platformStatus === 'trial') {
      return 'تجريبي';
    }
    if (teacher.subscription?.plan) {
      return teacher.subscription.plan.nameArabic || teacher.subscription.plan.name;
    }
    return 'بدون خطة';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="text-center text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="text-center text-gray-500">لا يوجد مدرسين</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المدرس</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الخطة</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الطلاب</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الكورسات</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإيرادات</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher, idx) => (
              <motion.tr
                key={teacher._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <Users className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{teacher.fullName}</p>
                      <p className="text-sm text-gray-500">{teacher.platformName}</p>
                      {teacher.specialization && (
                        <p className="text-xs text-gray-400">{teacher.specialization}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(teacher)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {teacher.subscription?.plan && (
                      <Crown size={16} className="text-yellow-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {getPlanName(teacher)}
                    </span>
                  </div>
                  {teacher.subscription?.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      حتى {new Date(teacher.subscription.endDate).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={16} />
                    <span className="font-medium">{teacher.stats.totalStudents}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen size={16} />
                    <span className="font-medium">{teacher.stats.activeCourses}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 w-fit">
                    <Coins size={16} className="text-green-600" />
                    <span className="font-bold text-green-700">{teacher.stats.totalRevenue.toLocaleString()}</span>
                    <span className="text-sm font-semibold text-green-600">ج.م</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails?.(teacher)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit?.(teacher)}
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

