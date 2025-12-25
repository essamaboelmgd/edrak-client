import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Filter, MoreVertical, Users, Edit, Trash2 } from 'lucide-react';

const myCourses = [
  { id: 1, name: 'الرياضيات المتقدمة', students: 120, lessons: 24, status: 'نشط', revenue: '12,000 ج.م' },
  { id: 2, name: 'الفيزياء', students: 89, lessons: 18, status: 'نشط', revenue: '8,500 ج.م' },
  { id: 3, name: 'الكيمياء', students: 156, lessons: 30, status: 'نشط', revenue: '15,600 ج.م' },
  { id: 4, name: 'الأحياء', students: 45, lessons: 12, status: 'مسودة', revenue: '0 ج.م' },
];

export default function TeacherCourses() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">كورساتي</h1>
          <p className="text-gray-500 mt-1">إدارة وإنشاء الكورسات الخاصة بك</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
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
            className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          <span>فلتر</span>
        </button>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">اسم الكورس</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الطلاب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الدروس</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإيرادات</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myCourses.map((course) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: course.id * 0.1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <BookOpen className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{course.name}</p>
                        <p className="text-sm text-gray-500">كورس تعليمي</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users size={16} />
                      <span className="font-medium">{course.students}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium">{course.lessons} درس</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      course.status === 'نشط' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-green-600">{course.revenue}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
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
    </div>
  );
}

