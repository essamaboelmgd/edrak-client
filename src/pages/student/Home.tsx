import { motion } from 'framer-motion';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyCourses } from '@/features/student/hooks/useStudentCourses';
import { useNavigate } from 'react-router-dom';

const stats = [
  {
    title: 'الكورسات المسجلة',
    value: '0',
    change: '0',
    isPositive: true,
    icon: BookOpen,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    title: 'الدروس المكتملة',
    value: '0',
    change: '0',
    isPositive: true,
    icon: Award,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    title: 'ساعات التعلم',
    value: '0',
    change: '0',
    isPositive: true,
    icon: Clock,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    title: 'المستوى الحالي',
    value: 'مبتدئ',
    change: '--',
    isPositive: true,
    icon: TrendingUp,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
];

export default function StudentHome() {
  const { user } = useAuth();
  const { data: myCourses, isLoading } = useMyCourses();
  const navigate = useNavigate();

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            مرحباً، <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.firstName || 'طالب'}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">استمر في رحلتك التعليمية</p>
          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
            طالب
          </span>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar size={18} />
            <span>جدول الحصص</span>
          </button>
          <button 
            onClick={() => navigate('/student/courses')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
            <BookOpen size={18} />
            <span>استكشف الكورسات</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-100 border border-white hover:border-blue-100 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.lightColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} className={stat.textColor} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-gray-100 border border-white p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">كورساتي</h3>
            <button 
                onClick={() => navigate('/student/courses')}
                className="text-blue-600 text-sm font-medium hover:underline"
            >
                عرض الكل
            </button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
                <div className="text-center text-gray-500">جاري التحميل...</div>
            ) : myCourses?.courses?.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    لا توجد كورسات مسجلة حالياً
                    <div className="mt-4">
                        <button 
                            onClick={() => navigate('/student/courses')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            تصفح الكورسات
                        </button>
                    </div>
                </div>
            ) : (
                myCourses?.courses?.map((course: any) => (
                <div 
                    key={course._id} 
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                >
                    <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                        {course.poster?.url ? (
                            <img src={course.poster.url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <BookOpen className="text-white" size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 mb-1">{course.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{course.teacher?.firstName} {course.teacher?.lastName}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {course.educationalLevel?.name}
                        </span>
                    </div>
                    </div>
                    <button className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                    <PlayCircle size={20} />
                    </button>
                </div>
                ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-white p-6"
        >
          <h3 className="font-bold text-lg text-gray-800 mb-6">إجراءات سريعة</h3>
          <div className="space-y-3">
            <button 
                onClick={() => navigate('/student/courses')}
                className="w-full p-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors text-right flex items-center justify-between group"
            >
              <span>استكشف الكورسات</span>
              <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform rotate-180" />
            </button>
            <button className="w-full p-4 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors text-right flex items-center justify-between group">
              <span>الاختبارات</span>
              <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform rotate-180" />
            </button>
            <button className="w-full p-4 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors text-right flex items-center justify-between group">
              <span>الشهادات</span>
              <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform rotate-180" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
