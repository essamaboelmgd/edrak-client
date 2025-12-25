import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, MoreVertical, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import coursesService, { ICourseSection } from '@/features/courses/coursesService';
import { client } from '@/api/client';

export default function CourseSections() {
  const [sections, setSections] = useState<ICourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameArabic: '',
    description: '',
    educationalLevel: '',
    order: 1,
    status: 'active'
  });

  useEffect(() => {
    fetchSections();
    fetchEducationalLevels();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await coursesService.getCourseSections();
      setSections(response.data.sections || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEducationalLevels = async () => {
    try {
      const res = await client.get('/educational-levels');
      // Flatten logic similar to StudentSignup
      const data = res.data?.data?.educationalLevels;
      if (data && !Array.isArray(data)) {
        const flattened = [
             ...(data.primary || []),
             ...(data.preparatory || []),
             ...(data.secondary || [])
        ].sort((a, b) => a.order - b.order);
        setEducationalLevels(flattened);
      } else if (Array.isArray(data)) {
        setEducationalLevels(data);
      } else if (Array.isArray(res.data?.data)){
         setEducationalLevels(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch levels:', err);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await coursesService.createCourseSection(formData);
      setIsModalOpen(false);
      fetchSections(); // Refresh list
      // Reset form
      setFormData({
        name: '',
        nameArabic: '',
        description: '',
        educationalLevel: '',
        order: 1,
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to create section:', error);
      alert('فشل إنشاء القسم');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">أقسام الكورسات</h1>
                <p className="text-gray-500">نظم كورساتك في أقسام رئيسية</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
                <Plus size={20} />
                <span>قسم جديد</span>
            </button>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <motion.div
                        key={section._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                        onClick={() => navigate(`/teacher/courses/sections/${section._id}`)}
                    >
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                            <Folder size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{section.nameArabic}</h3>
                        <p className="text-sm text-gray-400 mb-4">{section.name}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{section.stats?.totalCourses || 0} كورس</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{section.stats?.totalStudents || 0} طالب</span>
                        </div>

                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                             <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                <MoreVertical size={18} />
                             </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
        
        {!loading && sections.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                    <Folder size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد أقسام بعد</h3>
                <p className="text-gray-500 mb-6">ابدأ بإنشاء أول قسم لتنظيم كورساتك</p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                    إنشاء قسم جديد
                </button>
            </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
            {isModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setIsModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white rounded-3xl shadow-2xl z-50 p-8"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">إنشاء قسم جديد</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم (بالعربية)</label>
                                <input 
                                    required
                                    value={formData.nameArabic}
                                    onChange={e => setFormData({...formData, nameArabic: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="مثال: قسم الرياضيات"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم (باللغة الإنجليزية - اختياري)</label>
                                <input 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 text-left"
                                    placeholder="e.g. Mathematics Section"
                                    style={{ direction: 'ltr' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة الدراسية</label>
                                <select 
                                    required 
                                    value={formData.educationalLevel}
                                    onChange={e => setFormData({...formData, educationalLevel: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">اختر المرحلة</option>
                                    {educationalLevels.map(level => (
                                        <option key={level._id} value={level._id}>{level.name}</option>
                                    ))}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                                    placeholder="وصف مختصر للقسم..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={createLoading}
                                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                            >
                                {createLoading ? <Loader2 className="animate-spin" /> : 'إنشاء القسم'}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
}
