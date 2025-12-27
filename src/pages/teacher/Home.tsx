import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Calendar,
  GraduationCap,
  FileText,
  Layers
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/features/user/userService';

const initialStats = [
  {
    key: 'students',
    title: 'إجمالي الطلاب',
    value: '0',
    change: '0',
    isPositive: true,
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    key: 'courses',
    title: 'الكورسات النشطة',
    value: '0',
    change: '0',
    isPositive: true,
    icon: BookOpen,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    key: 'revenue',
    title: 'إجمالي الأرباح',
    value: '0 ج.م',
    change: '0',
    isPositive: true,
    icon: DollarSign,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    key: 'lessons',
    title: 'إجمالي الدروس',
    value: '0',
    change: '0',
    isPositive: true,
    icon: FileText,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
];

export default function TeacherHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await userService.getTeacherStatistics();
          const data = response.data.statistics;

          setStatistics(data);
          setCourses(data.courses || []);
          setRevenueChartData(data.revenueByDay || []);

          setStats(prev => prev.map(stat => {
            if (stat.key === 'students') return { ...stat, value: (data.totalStudents || 0).toString() };
            if (stat.key === 'courses') return { ...stat, value: (data.totalCourses || 0).toString() };
            if (stat.key === 'revenue') return { ...stat, value: `${data.totalRevenue || 0} ج.م` };
            if (stat.key === 'lessons') return { ...stat, value: (data.totalLessons || 0).toString() };
            return stat;
          }));
        } catch (error) {
          console.error("Failed to fetch teacher stats", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            مرحباً، <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{user?.firstName || 'مدرس'}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">إليك ملخص لما يحدث في منصتك اليوم</p>
          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
            <GraduationCap size={12} className="inline mr-1" />
            مدرس
          </span>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar size={18} />
            <span>آخر 30 يوم</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95">
            <span className="font-bold">+</span>
            <span>كورس جديد</span>
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
            className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-100 border border-white hover:border-purple-100 transition-all group"
          >
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-gray-100 border border-white p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">الإيرادات (آخر 30 يوم)</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
          </div>

          {loading ? (
            <div className="h-64 animate-pulse bg-gray-100 rounded-xl"></div>
          ) : revenueChartData.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">لا توجد بيانات إيرادات بعد</p>
            </div>
          ) : (
            <div className="h-64 w-full bg-gradient-to-b from-purple-50 to-white rounded-xl border border-purple-50 flex items-end justify-between px-4 pb-2 overflow-x-auto">
              {revenueChartData.map((day, i) => {
                const maxRevenue = Math.max(...revenueChartData.map(d => d.revenue), 1);
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[40px]">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg opacity-80 hover:opacity-100 transition-all hover:scale-y-110 origin-bottom cursor-pointer group relative"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${day.day}: ${day.revenue} ج.م (${day.count} اشتراك)`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {day.revenue} ج.م
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-center whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                      {day.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Last New Students & Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-white p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">آخر الطلاب الجدد</h3>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16"></div>
              ))}
            </div>
          ) : statistics?.lastNewStudents && statistics.lastNewStudents.length > 0 ? (
            <div className="space-y-3 mb-6">
              {statistics.lastNewStudents.slice(0, 5).map((student: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    {student.fullName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{student.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(student.subscribedAt).toLocaleDateString('ar-EG')} - {student.amount} ج.م
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 mb-6">
              <Users size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">لا يوجد طلاب جدد</p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100">
            <h4 className="font-bold text-sm text-gray-700 mb-4">ملخص سريع</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">إجمالي الاشتراكات</span>
                <span className="font-bold text-gray-800">{statistics?.totalSubscriptions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">إجمالي الأقسام</span>
                <span className="font-bold text-gray-800">{statistics?.totalCourseSections || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">إجمالي المشاهدات</span>
                <span className="font-bold text-gray-800">
                  {courses.reduce((sum, course) => sum + (course.statistics?.totalViews || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Courses List */}
      {courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-white p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">كورساتي</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-800 text-lg">{course.courseName}</h4>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    {course.statistics?.totalSubscribers || 0} مشترك
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={16} className="text-blue-500" />
                    <span>{course.statistics?.totalLessons || 0} درس</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Layers size={16} className="text-green-500" />
                    <span>{course.statistics?.totalLessonSections || 0} قسم</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen size={16} className="text-orange-500" />
                    <span>{course.statistics?.totalExams || 0} امتحان</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={16} className="text-green-500" />
                    <span>{course.statistics?.totalRevenue || 0} ج.م</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

