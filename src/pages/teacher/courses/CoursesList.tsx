import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Loader2, X, UploadCloud, Image as ImageIcon, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import coursesService, { ICourse, ICourseSection } from '@/features/courses/coursesService';
import { client } from '@/api/client';
import { getImageUrl } from '@/lib/axios';

const initialForm = {
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
};

export default function CoursesList() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [educationalLevels, setEducationalLevels] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState<ICourseSection | null>(null);
  const [editingCourse, setEditingCourse] = useState<ICourse | null>(null);
  
  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState(initialForm);

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
          const response = await coursesService.getCourseSections(1, 100);
          const sections = response.data.sections || [];
          const section = sections.find((s: any) => s._id === sectionId);
          if (section) {
              setCurrentSection(section);
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

  const handleOpenCreate = () => {
      setEditingCourse(null);
      setFormData(initialForm);
      if (currentSection) {
         if (currentSection.educationalLevel && typeof currentSection.educationalLevel === 'object') {
             // @ts-ignore
             setFormData(prev => ({ ...prev, educationalLevel: currentSection.educationalLevel._id }));
         } else if (currentSection.educationalLevel) {
             // @ts-ignore
             setFormData(prev => ({ ...prev, educationalLevel: currentSection.educationalLevel }));
         }
      }
      setIsModalOpen(true);
  };

  const handleOpenEdit = (course: ICourse) => {
      setEditingCourse(course);
      setFormData({
          title: course.title,
          description: course.description,
          price: course.price,
          discount: course.discount,
          educationalLevel: course.educationalLevel?._id || '',
          poster: course.poster,
          status: course.status as any,
          type: 'regular',
          isFree: false, // Default or fetch logic
          startDate: course.startDate ? course.startDate.split('T')[0] : '',
          endDate: course.endDate ? course.endDate.split('T')[0] : ''
      });
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setCreateLoading(true);
      try {
          if (editingCourse) {
              await coursesService.updateCourse(editingCourse._id, {
                  ...formData,
                  courseSection: sectionId
              });
          } else {
              await coursesService.createCourse({
                  ...formData,
                  courseSection: sectionId
              });
          }
          setIsModalOpen(false);
          fetchCourses();
          setFormData(initialForm);
      } catch (error) {
          console.error("Failed to save course", error);
          alert("فشل حفظ الكورس");
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

  const handleDelete = async () => {
      if (!courseToDelete) return;
      setDeleteLoading(true);
      try {
          await coursesService.deleteCourse(courseToDelete._id);
          setIsDeleteModalOpen(false);
          setCourseToDelete(null);
          fetchCourses();
      } catch (error) {
          console.error("Failed to delete course", error);
          alert("فشل حذف الكورس");
      } finally {
          setDeleteLoading(false);
      }
  };

  return (
    <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div>
                 <button onClick={() => navigate('/teacher/courses')} className="text-sm text-gray-500 hover:text-purple-600 mb-2 flex items-center gap-1 font-medium transition-colors">
                    <span className="text-lg rotate-180">➜</span> العودة للأقسام
                </button>
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {currentSection ? `${currentSection.nameArabic}` : 'الكورسات المتاحة'}
                    </h1>
                </div>
                <p className="text-gray-400 mt-1">إدارة الكورسات والمحتوى التعليمي</p>
            </div>
             <button 
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 transform hover:-translate-y-1"
            >
                <Plus size={20} />
                <span className="font-bold">كورس جديد</span>
            </button>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-72 bg-white rounded-3xl animate-pulse shadow-sm border border-gray-100"></div>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, index) => (
                    <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 overflow-hidden group relative cursor-pointer"
                        onClick={() => navigate(`/teacher/courses/${course._id}/builder`)}
                    >
                        {/* Poster Image */}
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                            <img 
                                src={getImageUrl(course.poster) || 'https://via.placeholder.com/400x200?text=Course+Poster'} 
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 shadow-sm flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                                {course.educationalLevel?.name}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 line-clamp-1 mb-2 group-hover:text-purple-600 transition-colors">
                                {course.title}
                            </h3>
                            
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10 leading-relaxed">
                                {course.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 mb-1">السعر</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-purple-600">{course.finalPrice}</span>
                                        <span className="text-xs text-gray-500">ج.م</span>
                                        {course.discount > 0 && (
                                            <span className="text-xs text-gray-300 line-through decoration-red-300 decoration-2">{course.price}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                     <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 mb-1">الحالة</span>
                                        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${course.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {course.status === 'active' ? 'نشط' : 'مسودة'}
                                        </span>
                                     </div>
                                </div>
                            </div>
                        </div>

                         {/* Hover Actions Overlay */}
                         <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2" onClick={e => e.stopPropagation()}>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(course); }}
                                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm transition-colors"
                                title="تعديل"
                            >
                                <Edit size={18} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); setCourseToDelete(course); setIsDeleteModalOpen(true); }}
                                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 shadow-sm transition-colors"
                                title="حذف"
                            >
                                <Trash2 size={18} />
                             </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
        
        {!loading && courses.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                    <BookOpen size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد كورسات في هذا القسم</h3>
                <p className="text-gray-500 mb-6">أضف كورس جديد لتبدأ رحلة التعليم</p>
                <button 
                    onClick={handleOpenCreate}
                    className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                >
                    إنشاء كورس جديد
                </button>
            </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
            {isModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setIsModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-[95%] max-w-3xl h-fit max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl z-50 p-8 scrollbar-hide"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{editingCourse ? 'تعديل الكورس' : 'إنشاء كورس جديد'}</h2>
                                <p className="text-gray-500 text-sm mt-1">{editingCourse ? 'تعديل بيانات الكورس الحالي' : 'املأ البيانات التالية لإضافة كورس جديد'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم الكورس</label>
                                    <input 
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                        placeholder="مثال: كورس الرياضيات الشامل"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] transition-all"
                                        placeholder="وصف مختصر للكورس..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">السعر (ج.م)</label>
                                    <input 
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">الخصم (%)</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-between items-center text-sm pt-2 border-t border-gray-200/50">
                                   <span className="text-gray-500 font-medium">السعر النهائي للطالب:</span>
                                   <div className="flex items-center gap-2">
                                       <span className="font-bold text-purple-600 text-2xl">
                                           {formData.price - (formData.price * (formData.discount / 100))}
                                       </span>
                                       <span className="text-gray-500 font-medium">ج.م</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">المرحلة الدراسية</label>
                                    <select 
                                        required 
                                        value={formData.educationalLevel}
                                        onChange={e => setFormData({...formData, educationalLevel: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">اختر المرحلة</option>
                                        {educationalLevels.map(level => (
                                            <option key={level._id} value={level._id}>{level.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">صورة الكورس</label>
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
                                                className="flex flex-col items-center justify-center w-full h-[3.25rem] border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 h-[100px]"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <UploadCloud className="w-6 h-6 text-purple-600 mb-1" />
                                                    <p className="text-xs text-gray-500 font-medium">اضغط لرفع صورة</p>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="relative w-full h-[100px] rounded-xl overflow-hidden border border-gray-200 group-hover:border-purple-500 transition-all">
                                                <img 
                                                    src={getImageUrl(formData.poster)} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                                    <label 
                                                        htmlFor="poster-upload"
                                                        className="p-1.5 bg-white/90 rounded-lg cursor-pointer hover:bg-white hover:text-purple-600 transition-colors shadow-lg"
                                                    >
                                                        <ImageIcon size={16} />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, poster: '' }))}
                                                        className="p-1.5 bg-white/90 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors shadow-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {uploadLoading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-20">
                                                <Loader2 className="animate-spin text-purple-600" size={20} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البداية</label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ النهاية</label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={createLoading}
                                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-xl shadow-purple-200 flex items-center justify-center gap-2 mt-4"
                            >
                                {createLoading ? <Loader2 className="animate-spin" /> : (editingCourse ? 'حفظ التغييرات' : 'إنشاء الكورس')}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
            {isDeleteModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setIsDeleteModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 m-auto w-[95%] max-w-md h-fit bg-white rounded-3xl shadow-2xl z-50 p-6 text-center"
                    >
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">هل أنت متأكد من الحذف؟</h3>
                        <p className="text-gray-500 text-sm mb-6">لا يمكن التراجع عن هذا الإجراء سيتم حذف الكورس وجميع محتوياته.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : 'حذف الكورس'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
}
