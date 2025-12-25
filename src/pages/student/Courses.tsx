import { motion } from 'framer-motion';
import { Search, PlayCircle, Star, Clock } from 'lucide-react';

const availableCourses = [
  { id: 1, name: 'الرياضيات المتقدمة', teacher: 'أحمد محمد', rating: 4.8, students: 120, price: '500 ج.م', thumbnail: 'https://ui-avatars.com/api/?name=Math&background=3b82f6' },
  { id: 2, name: 'الفيزياء', teacher: 'سارة علي', rating: 4.9, students: 89, price: '450 ج.م', thumbnail: 'https://ui-avatars.com/api/?name=Physics&background=8b5cf6' },
  { id: 3, name: 'الكيمياء', teacher: 'محمد حسن', rating: 4.7, students: 156, price: '400 ج.م', thumbnail: 'https://ui-avatars.com/api/?name=Chemistry&background=10b981' },
  { id: 4, name: 'الأحياء', teacher: 'نور أحمد', rating: 4.6, students: 98, price: '480 ج.م', thumbnail: 'https://ui-avatars.com/api/?name=Biology&background=f59e0b' },
  { id: 5, name: 'اللغة العربية', teacher: 'خالد محمود', rating: 4.9, students: 203, price: '350 ج.م', thumbnail: 'https://ui-avatars.com/api/?name=Arabic&background=ef4444' },
  { id: 6, name: 'اللغة الإنجليزية', teacher: 'فاطمة علي', rating: 4.8, students: 187, price: '420 ج.م', thumbnail: 'https://ui-avatars.com/api/?name=English&background=06b6d4' },
];

export default function StudentCourses() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">استكشف الكورسات</h1>
          <p className="text-gray-500 mt-1">اختر الكورس المناسب لك وابدأ رحلتك التعليمية</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="ابحث عن كورس..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCourses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: course.id * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-500 relative">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <PlayCircle size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{course.name}</h3>
                  <p className="text-sm text-gray-500">{course.teacher}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} className="fill-current" />
                  <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {course.students} طالب
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">{course.price}</span>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  عرض التفاصيل
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

