import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, MoreVertical, Users, Loader2, X, UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import coursesService, { ICourse, ICourseSection } from '@/features/courses/coursesService';
import { client } from '@/api/client';
import { getImageUrl } from '@/lib/axios';

export default function CoursesList() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState<ICourseSection | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    discount: 0,
    educationalLevel: '',
    poster: '',
    status: 'active' as const,
    type: 'regular' as const,
    isFree: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  useEffect(() => {
    if (sectionId) {
      fetchCourses();
      fetchSectionDetails();
      fetchEducationalLevels();
    }
  }, [sectionId]);

  const fetchCourses = async () => {
    try {
      const response = await coursesService.getCourses({ courseSection: sectionId });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionDetails = async () => {
      try {
          // Since we don't have a direct ID endpoint yet, we fetch all and find
          // Efficient enough for typical usage
          const response = await coursesService.getCourseSections(1, 100);
          const sections = response.data.sections || [];
          const section = sections.find((s: any) => s._id === sectionId);
          if (section) {
              setCurrentSection(section);
              // Auto-set educational level if available in section (it's populated)
              if (section.educationalLevel && typeof section.educationalLevel === 'object') {
                  setFormData(prev => ({ ...prev, educationalLevel: section.educationalLevel._id }));
              } else if (section.educationalLevel) {
                  setFormData(prev => ({ ...prev, educationalLevel: section.educationalLevel }));
              }
          }
      } catch (error) {
          console.error('Failed to fetch section details:', error);
      }
  };

  const fetchEducationalLevels = async () => {
    try {
      const res = await client.get('/educational-levels');
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
          await coursesService.createCourse({
              ...formData,
              courseSection: sectionId
          });
          setIsModalOpen(false);
          fetchCourses();
          // Reset form (keep level if set)
          setFormData(prev => ({
              ...prev,
              title: '',
              description: '',
              price: 0,
              discount: 0,
              poster: ''
          }));
      } catch (error) {
          console.error("Failed to create course", error);
          alert("فشل إنشاء الكورس");
      } finally {
          setCreateLoading(false);
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setUploadLoading(true);
        try {
          const response = await coursesService.uploadPoster(file);
          if (response.success && response.data.url) {
              setFormData(prev => ({ ...prev, poster: response.data.url }));
          }
        } catch (error) {
          console.error("Failed to upload poster", error);
          alert("فشل رفع الصورة");
        } finally {
            setUploadLoading(false);
        }
      }
    };

  return (
    <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
                 <button onClick={() => navigate('/teacher/courses')} className="text-sm text-gray-500 hover:text-purple-600 mb-1 flex items-center gap-1">
                    <span className="text-lg">→</span> العودة للأقسام
                </button>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {currentSection ? `كورسات: ${currentSection.nameArabic}` : 'الكورسات المتاحة'}
                    </h1>
                </div>
                <p className="text-gray-500 text-sm">إدارة الكورسات داخل هذا القسم</p>
            </div>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
                <Plus size={20} />
                <span>كورس جديد</span>
            </button>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <motion.div
                        key={course._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group relative"
                        onClick={() => navigate(`/teacher/courses/${course._id}/builder`)}
                    >
                        {/* Poster Image */}
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                            <img 
                                src={getImageUrl(course.poster) || 'https://via.placeholder.com/400x200?text=Course+Poster'} 
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-purple-600 shadow-sm">
                                {course.educationalLevel?.name}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-relaxed group-hover:text-purple-600 transition-colors">
                                    {course.title}
                                </h3>
                            </div>
                            
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
                                <div className="flex items-center gap-1">
                                    <Users size={14} />
                                    <span>{course.stats?.totalStudents || 0} طالب</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen size={14} />
                                    <span>{course.stats?.totalLessons || 0} درس</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4 pt-1">
                                <div className="flex items-center gap-1 font-bold text-gray-800">
                                    <span className="text-lg text-purple-600">{course.finalPrice}</span>
                                    <span className="text-xs">ج.م</span>
                                    {course.discount > 0 && (
                                        <span className="text-xs text-gray-300 line-through mr-1">{course.price}</span>
                                    )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-md ${course.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {course.status === 'active' ? 'نشط' : 'مسودة'}
                                </span>
                            </div>
                        </div>

                         <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                             <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-purple-600 shadow-sm">
                                <MoreVertical size={18} />
                             </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
        
        {!loading && courses.length === 0 && (
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">لا توجد كورسات في هذا القسم</h3>
                <p className="text-gray-400 text-sm">أضف كورس جديد لتبدأ</p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                    إنشاء كورس جديد
                </button>
            </div>
        )}

        {/* Create Course Modal */}
        <AnimatePresence>
            {isModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setIsModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 p-8"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">إنشاء كورس جديد</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكورس</label>
                                    <input 
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="مثال: كورس الرياضيات الشامل"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                                        placeholder="وصف مختصر للكورس..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م)</label>
                                    <input 
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الخصم (%)</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-between items-center text-sm pt-2">
                                   <span className="text-gray-500">السعر النهائي:</span>
                                   <span className="font-bold text-purple-600 text-lg">
                                       {formData.price - (formData.price * (formData.discount / 100))} ج.م
                                   </span>
                                </div>
                            </div>


    

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">صورة الكورس</label>
                                    <div className="relative group">
                                        <input 
                                            type="file"
                                            id="poster-upload"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        
                                        {!formData.poster ? (
                                            <label 
                                                htmlFor="poster-upload"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                        <UploadCloud className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    <p className="mb-1 text-sm text-gray-500">
                                                        <span className="font-semibold">اضغط للرفع</span> أو اسحب الصورة هنا
                                                    </p>
                                                    <p className="text-xs text-gray-400">PNG, JPG or WEBP (Max 5MB)</p>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 group-hover:border-purple-500 transition-all">
                                                <img 
                                                    src={getImageUrl(formData.poster)} 
                                                    alt="Course Poster" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                                    <label 
                                                        htmlFor="poster-upload"
                                                        className="p-2 bg-white/90 rounded-full cursor-pointer hover:bg-white hover:text-purple-600 transition-colors shadow-lg"
                                                        title="تغيير الصورة"
                                                    >
                                                        <ImageIcon size={18} />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, poster: '' }))}
                                                        className="p-2 bg-white/90 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-lg"
                                                        title="حذف الصورة"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Loading State Overlay */}
                                        {uploadLoading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10 border border-purple-100">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="animate-spin text-purple-600" size={24} />
                                                    <span className="text-sm font-medium text-purple-700">جاري الرفع...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="isFree"
                                    checked={formData.isFree}
                                    onChange={e => setFormData({...formData, isFree: e.target.checked})}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="isFree" className="text-sm font-medium text-gray-700">كورس مجاني</label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={createLoading}
                                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                            >
                                {createLoading ? <Loader2 className="animate-spin" /> : 'إنشاء الكورس'}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
}
