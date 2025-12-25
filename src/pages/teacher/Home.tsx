import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Calendar,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const stats = [
  {
    title: 'إجمالي الطلاب',
    value: '1,234',
    change: '+12%',
    isPositive: true,
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    title: 'الكورسات النشطة',
    value: '24',
    change: '+3',
    isPositive: true,
    icon: BookOpen,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    title: 'إجمالي الأرباح',
    value: '45,200 ج.م',
    change: '+18%',
    isPositive: true,
    icon: DollarSign,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    title: 'النمو الشهري',
    value: '8.5%',
    change: '-2%',
    isPositive: false,
    icon: TrendingUp,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
];

const recentActivity = [
  { id: 1, user: 'محمد أحمد', action: 'اشترك في كورس الفيزياء', time: 'منذ 5 دقائق', avatar: 'https://ui-avatars.com/api/?name=Mohamed+Ahmed&background=random' },
  { id: 2, user: 'سارة علي', action: 'أتمت اختبار الوحدة الأولى', time: 'منذ 15 دقيقة', avatar: 'https://ui-avatars.com/api/?name=Sara+Ali&background=random' },
  { id: 3, user: 'كريم محمود', action: 'سجل حساب جديد', time: 'منذ 30 دقيقة', avatar: 'https://ui-avatars.com/api/?name=Kareem+Mahmoud&background=random' },
  { id: 4, user: 'نور حسن', action: 'علقت على الدرس الثاني', time: 'منذ ساعة', avatar: 'https://ui-avatars.com/api/?name=Nour+Hassan&background=random' },
];

export default function TeacherHome() {
  const { user } = useAuth();

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
        {/* Main Chart Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-gray-100 border border-white p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">تحليل الأداء</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
          </div>
          <div className="h-64 w-full bg-gradient-to-b from-purple-50 to-white rounded-xl border border-purple-50 flex items-end justify-between px-6 pb-0 overflow-hidden relative group">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm z-10">
              <p className="text-purple-600 font-bold">مخطط بياني تفاعلي (قريباً)</p>
            </div>
            {[40, 70, 45, 90, 60, 80, 50, 75, 60, 85, 95, 70].map((h, i) => (
              <div key={i} className="w-[6%] bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg opacity-80 hover:opacity-100 transition-all hover:scale-y-110 origin-bottom" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-white p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">أحدث النشاطات</h3>
            <button className="text-purple-600 text-sm font-medium hover:underline">عرض الكل</button>
          </div>

          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-bold text-gray-800 truncate">{activity.user}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl border border-gray-100 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group">
            <span>تحميل المزيد</span>
            <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform rotate-180" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

