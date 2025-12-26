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
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-56 bg-white rounded-3xl animate-pulse shadow-sm border border-gray-100"></div>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((section, index) => (
                    <motion.div
                        key={section._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-white rounded-3xl p-1 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => navigate(`/teacher/courses/sections/${section._id}`)}
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        
                        <div className="relative p-6 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 z-10">
                                    <Folder size={28} strokeWidth={1.5} />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); /* Add edit/delete logic */ }}
                                        className="p-2 hover:bg-white/80 rounded-xl text-gray-400 hover:text-purple-600 transition-colors backdrop-blur-sm"
                                     >
                                        <MoreVertical size={20} />
                                     </button>
                                </div>
                            </div>
                            
                            <div className="mb-6 flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-relaxed group-hover:text-purple-700 transition-colors">
                                    {section.nameArabic}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium font-english">
                                    {section.name || 'Untitled Section'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-2xl p-4 group-hover:bg-purple-50/50 transition-colors border border-transparent group-hover:border-purple-100">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-xs mb-1">عدد الكورسات</span>
                                    <span className="font-bold text-gray-800 text-lg">{section.stats?.totalCourses || 0}</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200 group-hover:bg-purple-200 transition-colors" />
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-400 text-xs mb-1">الطلاب المشتركين</span>
                                    <span className="font-bold text-gray-800 text-lg">{section.stats?.totalStudents || 0}</span>
                                </div>
                            </div>
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
                        className="fixed inset-0 m-auto w-[95%] max-w-lg h-fit bg-white rounded-3xl shadow-2xl z-50 p-8"
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
