import { motion } from 'framer-motion';
import { Users, BookOpen, Coins, CheckCircle2, XCircle, Clock, Crown } from 'lucide-react';
import { ITeacherAdmin } from '../services/teachersService';

interface TeacherCardProps {
  teacher: ITeacherAdmin;
  onViewDetails?: (teacher: ITeacherAdmin) => void;
  onEdit?: (teacher: ITeacherAdmin) => void;
}

export default function TeacherCard({ teacher, onViewDetails, onEdit }: TeacherCardProps) {
  const isInTrial = teacher.trial?.isInTrial || teacher.platformStatus === 'trial';
  const hasActiveSubscription = teacher.subscription?.isActive && !isInTrial;
  const isSuspended = teacher.platformStatus === 'suspended';
  const isExpired = teacher.platformStatus === 'expired';

  const getStatusBadge = () => {
    if (isSuspended) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
          <XCircle size={12} />
          معطل
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 flex items-center gap-1">
          <Clock size={12} />
          منتهي
        </span>
      );
    }
    if (isInTrial) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1">
          <Clock size={12} />
          تجريبي ({teacher.trial?.trialDaysLeft || 0} يوم)
        </span>
      );
    }
    if (hasActiveSubscription) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
          <CheckCircle2 size={12} />
          نشط
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        غير نشط
      </span>
    );
  };

  const getPlanBadge = () => {
    if (isInTrial) {
      return (
        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
          تجريبي
        </span>
      );
    }
    if (teacher.subscription?.plan) {
      return (
        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
          <Crown size={12} />
          {teacher.subscription.plan.nameArabic || teacher.subscription.plan.name}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        بدون خطة
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
    >
      {/* Header */}
      <div className="h-32 bg-gradient-to-br from-red-500 to-orange-500 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-4 right-4 left-4">
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            {getPlanBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Teacher Info */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{teacher.fullName}</h3>
          <p className="text-sm text-gray-500">{teacher.platformName}</p>
          {teacher.specialization && (
            <p className="text-sm text-gray-600 mt-1">تخصص: {teacher.specialization}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Users size={16} />
            </div>
            <p className="text-lg font-bold text-gray-800">{teacher.stats.totalStudents}</p>
            <p className="text-xs text-gray-500">طالب</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <BookOpen size={16} />
            </div>
            <p className="text-lg font-bold text-gray-800">{teacher.stats.activeCourses}</p>
            <p className="text-xs text-gray-500">كورس</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Coins size={16} />
            </div>
            <p className="text-lg font-bold text-green-700">{teacher.stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs font-semibold text-green-600">ج.م</p>
          </div>
        </div>

        {/* Subscription Info */}
        {teacher.subscription && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">الخطة:</span>
              <span className="font-semibold text-gray-800">
                {teacher.subscription.plan?.nameArabic || teacher.subscription.plan?.name || 'بدون خطة'}
              </span>
            </div>
            {teacher.subscription.endDate && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">ينتهي في:</span>
                <span className="font-medium text-gray-700">
                  {new Date(teacher.subscription.endDate).toLocaleDateString('ar-EG')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-4 space-y-1 text-sm text-gray-600">
          <p className="truncate">{teacher.email}</p>
          <p>{teacher.mobileNumber}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(teacher)}
            className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            عرض التفاصيل
          </button>
          <button
            onClick={() => onEdit?.(teacher)}
            className="py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            تعديل
          </button>
        </div>
      </div>
    </motion.div>
  );
}

