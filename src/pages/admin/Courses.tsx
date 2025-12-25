import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Filter, MoreVertical } from 'lucide-react';

export default function AdminCourses() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">إدارة الكورسات</h1>
          <p className="text-gray-500 mt-1">عرض وإدارة جميع الكورسات في النظام</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <Plus size={18} />
          <span>كورس جديد</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ابحث عن كورس..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          <span>فلتر</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((course) => (
          <motion.div
            key={course}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: course * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="h-40 bg-gradient-to-br from-red-500 to-orange-500 relative">
              <button className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                <MoreVertical size={18} className="text-white" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">كورس الرياضيات المتقدم</h3>
                  <p className="text-sm text-gray-500">مدرس: أحمد محمد</p>
                </div>
                <BookOpen className="text-red-500" size={24} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>120 طالب</span>
                <span>•</span>
                <span>24 درس</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">
                  عرض التفاصيل
                </button>
                <button className="py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  تعديل
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

