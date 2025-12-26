import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, Settings, ChevronRight, LayoutDashboard, Users, Plus, Edit, Trash2, Loader2, UploadCloud, FileText, ChevronDown, PlayCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { client } from '@/api/client';
import { getImageUrl } from '@/lib/axios';
import coursesService from '@/features/courses/coursesService';

export default function CourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('curriculum');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [movingLessonId, setMovingLessonId] = useState<string | null>(null);
  
  // Curriculum State
  const [sections, setSections] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Modals State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Forms State
  const [sectionFormData, setSectionFormData] = useState({
      name: '',
      price: 0,
      discount: 0
  });
  const [sectionLoading, setSectionLoading] = useState(false);
  
  const [lessonFormData, setLessonFormData] = useState({
      title: '',
      description: '',
      type: 'video',
      videoUrl: '',
      videoProvider: 'youtube', // Default
      duration: 0,
      isFree: false,
      price: 0,
      discount: 0,
      status: 'active',
      poster: ''
  });
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonUploadLoading, setLessonUploadLoading] = useState(false);

  // Settings State
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      price: 0,
      discount: 0,
      poster: '',
      educationalLevel: '',
      startDate: '',
      endDate: ''
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
        fetchCourseDetails();
        fetchSections();
        fetchLessons();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await client.get(`/courses/${courseId}`);
      let c = null;
      if (response.data && response.data.data && response.data.data.course) {
          c = response.data.data.course;
      } else if (response.data && response.data.course) {
          c = response.data.course;
      } else if (response.data && response.data.data) {
          c = response.data.data;
      }

      if (c) {
          setCourse(c);
          
          setFormData({
              title: c.title || '',
              description: c.description || '',
              price: c.price || 0,
              discount: c.discount || 0,
              poster: c.poster || '',
              educationalLevel: c.educationalLevel?._id || c.educationalLevel || '',
              startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '',
              endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : ''
          });
      }
    } catch (error) {
      console.error("Failed to load course", error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionLessons = (sectionId: string) => {
      // Robust filtering for lessons
      return lessons.filter(l => {
          // Check lessonSection field (new standard)
          if (l.lessonSection === sectionId) return true;
          if (l.lessonSection && l.lessonSection._id === sectionId) return true;
          if (l.lessonSection && typeof l.lessonSection === 'string' && l.lessonSection === sectionId) return true;
          
          // Check section field (legacy support)
          if (l.section === sectionId) return true;
          if (l.section && l.section._id === sectionId) return true;
          
          return false;
      });
  };

  const fetchSections = async () => {
    try {
        if (!courseId) return;
        const res = await coursesService.getLessonSections(courseId);
        if (res.data && res.data.sections) {
            setSections(res.data.sections);
            setExpandedSections(res.data.sections.map((s: any) => s._id));
        } else if (res.data && res.data.lessonSections) {
             setSections(res.data.lessonSections);
        }
    } catch (error) {
        console.error("Failed to load sections", error);
    }
  };

  const fetchLessons = async () => {
      try {
          if (!courseId) return;
          const res = await client.get(`/courses/${courseId}/lessons`);
          
          if (res.data) {
            // Handle { data: [...] }
            if (res.data.data && Array.isArray(res.data.data)) {
                setLessons(res.data.data);
            } 
            // Handle { data: { lessons: [...] } }
            else if (res.data.data && res.data.data.lessons && Array.isArray(res.data.data.lessons)) {
                setLessons(res.data.data.lessons);
            }
            // Handle { lessons: [...] }
            else if (res.data.lessons && Array.isArray(res.data.lessons)) {
                setLessons(res.data.lessons);
            }
          }
      } catch (error) {
           console.error("Failed to load lessons", error);
      }
  }

  const handleMoveLesson = async (targetSectionId: string) => {
      if (!movingLessonId || !courseId) return;
      try {
          await coursesService.updateLesson(movingLessonId, {
              lessonSection: targetSectionId
          });
          setMovingLessonId(null);
          // Refresh data
          fetchLessons();
          fetchSections();
          alert("تم نقل الدرس بنجاح");
      } catch (error) {
          console.error("Failed to move lesson", error);
          alert("فشل نقل الدرس");
      }
  };

  const handleDeleteSection = async (sectionId: string) => {
      if (!confirm("هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذف جميع الدروس بداخلها.")) return;
      try {
          await coursesService.deleteLessonSection(sectionId);
          fetchSections();
          fetchLessons(); 
          alert("تم حذف الوحدة بنجاح");
      } catch (error) {
          console.error("Failed to delete section", error);
          alert("فشل حذف الوحدة");
      }
  };

  const handleDeleteLesson = async (lessonId: string) => {
      if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
      try {
          await coursesService.deleteLesson(lessonId);
          fetchLessons();
          alert("تم حذف الدرس بنجاح");
      } catch (error) {
          console.error("Failed to delete lesson", error);
          alert("فشل حذف الدرس");
      }
  };

  const openEditSectionModal = (section: any) => {
      setSectionFormData({
          name: section.name,
          price: section.price || 0,
          discount: section.discount || 0
      });
      setEditingSectionId(section._id);
      setIsSectionModalOpen(true);
  };

  const openEditLessonModal = (lesson: any) => {
      setLessonFormData({
          title: lesson.title,
          description: lesson.description || '',
          type: lesson.type,
          videoUrl: lesson.videoUrl || '',
          videoProvider: lesson.videoProvider || 'youtube',
          duration: lesson.duration || 0,
          isFree: lesson.isFree,
          price: lesson.price || 0,
          discount: lesson.discount || 0,
          status: lesson.status,
          poster: lesson.poster || ''
      });
      setEditingLessonId(lesson._id);
      setActiveSectionId(lesson.lessonSection || lesson.section); 
      setIsLessonModalOpen(true);
  };

  const handleCreateSection = async (e: FormEvent) => {
      e.preventDefault();
      if (!courseId) return;
      setSectionLoading(true);
      try {
          const payload = {
              name: sectionFormData.name,
              nameArabic: sectionFormData.name,
              price: Number(sectionFormData.price),
              discount: Number(sectionFormData.discount)
          };

          if (editingSectionId) {
              await coursesService.updateLessonSection(editingSectionId, payload);
              alert("تم تعديل الوحدة بنجاح");
          } else {
              await coursesService.createLessonSection({
                  ...payload,
                  course: courseId,
                  order: sections.length + 1
              });
              alert("تم إضافة الوحدة بنجاح");
          }
          setSectionFormData({ name: '', price: 0, discount: 0 });
          setEditingSectionId(null);
          setIsSectionModalOpen(false);
          fetchSections();
      } catch (error) {
          console.error("Failed to save section", error);
          alert("فشل حفظ الوحدة");
      } finally {
          setSectionLoading(false);
      }
  };

  const handleUpdateSettings = async (e: FormEvent) => {
      e.preventDefault();
      if (!courseId) return;
      setSettingsLoading(true);
      try {
          await coursesService.updateCourse(courseId, {
              ...formData,
              educationalLevel: formData.educationalLevel || undefined
          });
          alert("تم تحديث إعدادات الكورس بنجاح");
          fetchCourseDetails();
      } catch (error) {
          console.error("Failed to update settings", error);
          alert("فشل تحديث الإعدادات");
      } finally {
          setSettingsLoading(false);
      }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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

  const toggleSection = (sectionId: string) => {
      setExpandedSections(prev => 
          prev.includes(sectionId) 
          ? prev.filter(id => id !== sectionId) 
          : [...prev, sectionId]
      );
  };

  const handleLessonPosterChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLessonUploadLoading(true);
      try {
        const response = await coursesService.uploadPoster(file);
        if (response.success && response.data.url) {
            setLessonFormData(prev => ({ ...prev, poster: response.data.url }));
        }
      } catch (error) {
        console.error("Failed to upload lesson poster", error);
        alert("فشل رفع صورة الدرس");
      } finally {
          setLessonUploadLoading(false);
      }
    }
  };

  const handleCreateLesson = async (e: FormEvent) => {
      e.preventDefault();
      if (!courseId || (!activeSectionId && !editingLessonId)) return;
      setLessonLoading(true);
      try {
          // Base payload shared between create and update
          const basePayload = {
              title: lessonFormData.title,
              description: lessonFormData.description,
              poster: lessonFormData.poster,
              videoUrl: lessonFormData.videoUrl,
              videoProvider: lessonFormData.videoProvider,
              duration: Number(lessonFormData.duration),
              isFree: lessonFormData.isFree,
              price: Number(lessonFormData.price),
              discount: Number(lessonFormData.discount),
              status: lessonFormData.status,
              lessonSection: activeSectionId 
          };

          if (editingLessonId) {
             // For update, we don't send 'course' as it's not allowed in schema
             await coursesService.updateLesson(editingLessonId, basePayload);
             alert("تم تحديث الدرس بنجاح");
          } else {
             // For create, 'course' is required
             await coursesService.createLesson(courseId, {
                 ...basePayload,
                 course: courseId,
                 order: lessons.filter(l => l.section === activeSectionId).length + 1
             });
             alert("تم إضافة الدرس بنجاح");
          }
          
      setLessonFormData({
          title: '',
          description: '',
          type: 'video',
          videoUrl: '',
          videoProvider: 'youtube',
          duration: 0,
          isFree: false,
          price: 0,
          discount: 0,
          status: 'active',
          poster: ''
      });
          setEditingLessonId(null);
          setIsLessonModalOpen(false);
          fetchLessons();
          fetchSections(); 
      } catch (error) {
          console.error("Failed to save lesson", error);
          alert("فشل حفظ الدرس");
      } finally {
          setLessonLoading(false);
      }
  }

  // ... (Other handlers)

  // ... (Other handlers)


  if (loading) return <div className="p-8"><div className="animate-pulse h-32 bg-gray-100 rounded-2xl"></div></div>;
  if (!course) return <div className="p-8 text-center text-gray-500">Course not found</div>;

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'curriculum', label: 'المنهج والمحتوى', icon: Layers },
    { id: 'students', label: 'الطلاب', icon: Users },
    { id: 'settings', label: 'إعدادات الكورس', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm gap-3">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                 <button onClick={() => navigate('/teacher/courses/sections/' + course.courseSection)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                    <ChevronRight className="rotate-180" size={20} />
                 </button>
                 <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <img 
                        src={getImageUrl(course.poster) || 'https://via.placeholder.com/100'} 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                        alt=""
                    />
                    <div className="overflow-hidden">
                        <h1 className="font-bold text-gray-800 text-base md:text-lg leading-tight truncate">{course.title}</h1>
                        <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${course.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            {course.status === 'active' ? 'منشور' : 'مسودة'}
                        </p>
                    </div>
                 </div>
            </div>

            <div className="flex gap-2 shrink-0">
                 <button className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-lg shadow-purple-100 whitespace-nowrap">
                    معاينة <span className="hidden md:inline">الكورس</span>
                 </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="px-4 md:px-6 py-3 md:py-4 bg-white border-b border-gray-100 mb-4 md:mb-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-200' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <tab.icon size={16} className="md:w-[18px] md:h-[18px]" />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="px-4 md:px-6 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'curriculum' && (
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg md:text-xl font-bold text-gray-800">محتوى المنهج</h2>
                                <button 
                                    onClick={() => {
                                        setSectionFormData({ name: '', price: 0, discount: 0 });
                                        setEditingSectionId(null);
                                        setIsSectionModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-sm text-xs md:text-sm font-bold"
                                >
                                    <Plus size={16} className="md:w-[18px] md:h-[18px]" />
                                    وحدة جديدة
                                </button>
                            </div>

                            {sections.length === 0 ? (
                                <div className="text-center py-12 md:py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Layers size={24} className="md:w-8 md:h-8 text-purple-300" />
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1">لا يوجد محتوى</h3>
                                    <p className="text-gray-500 text-xs md:text-sm">ابدأ بإضافة الوحدات والفصول الدراسية للكورس.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 md:space-y-4">
                                    {sections.map((section) => (
                                        <div key={section._id} className="bg-white border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:border-purple-200 transition-all">
                                            {/* Section Header */}
                                            <div 
                                                className="p-3 md:p-5 flex flex-col md:flex-row md:justify-between md:items-center cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors gap-3"
                                                onClick={() => toggleSection(section._id)}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                                    <div 
                                                        className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-transform duration-300 shrink-0 ${
                                                            expandedSections.includes(section._id) 
                                                            ? 'bg-purple-100 text-purple-600 rotate-180' 
                                                            : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                    >
                                                        <ChevronDown size={16} className="md:w-[18px] md:h-[18px]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-800 text-base md:text-lg leading-tight">{section.name}</h3>
                                                        <p className="text-[10px] md:text-xs text-gray-400">
                                                            {getSectionLessons(section._id).length} دروس
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveSectionId(section._id);
                                                            setEditingLessonId(null);
                                                            setLessonFormData({ title: '', description: '', type: 'video', videoUrl: '', videoProvider: 'youtube', duration: 0, isFree: false, price: 0, discount: 0, status: 'active', poster: '' });
                                                            setIsLessonModalOpen(true);
                                                        }}
                                                        className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs md:text-sm font-medium hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm flex items-center gap-1.5 md:gap-2 flex-1 md:flex-none justify-center whitespace-nowrap"
                                                    >
                                                        <Plus size={14} className="md:w-4 md:h-4" />
                                                        درس جديد
                                                    </button>
                                                    <div className="hidden md:block h-6 w-px bg-gray-200 mx-1"></div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditSectionModal(section);
                                                        }}
                                                        className="p-1.5 md:p-2 hover:bg-white hover:text-blue-600 rounded-lg text-gray-400 transition-colors"
                                                    >
                                                        <Edit size={16} className="md:w-[18px] md:h-[18px]" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSection(section._id);
                                                        }}
                                                        className="p-1.5 md:p-2 hover:bg-white hover:text-red-600 rounded-lg text-gray-400 transition-colors"
                                                    >
                                                        <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Lessons List */}
                                            <AnimatePresence>
                                                {expandedSections.includes(section._id) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-gray-100"
                                                    >
                                                        <div className="p-2 space-y-1 bg-gray-50/20">
                                                            {getSectionLessons(section._id).length === 0 ? (
                                                                <div className="py-6 md:py-8 text-center text-gray-400 text-xs md:text-sm italic">
                                                                    لا توجد دروس في هذه الوحدة
                                                                </div>
                                                            ) : (
                                                                getSectionLessons(section._id).map((lesson, lessonIdx) => (
                                                                    <div key={lesson._id} className="group flex items-center justify-between p-2.5 md:p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                                                                {lesson.type === 'video' ? <PlayCircle size={14} className="md:w-4 md:h-4" /> : <FileText size={14} className="md:w-4 md:h-4" />}
                                                                            </div>
                                                                            <div className="overflow-hidden">
                                                                                <h4 className="font-bold text-gray-700 text-xs md:text-sm group-hover:text-purple-700 transition-colors truncate leading-tight">
                                                                                    {lessonIdx + 1}. {lesson.title}
                                                                                </h4>
                                                                                <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                                                                                    {lesson.type === 'video' ? 'فيديو' : 'نص'} • {lesson.isFree ? 'مجاني' : 'مدفوع'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-1 md:gap-2 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                             <button 
                                                                                onClick={() => openEditLessonModal(lesson)}
                                                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"

                                                                             >
                                                                                 <Edit size={14} />
                                                                             </button>
                                                                             <button 
                                                                                onClick={() => handleDeleteLesson(lesson._id)}
                                                                                className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                                                                             >
                                                                                 <Trash2 size={14} />
                                                                             </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}

                                    {/* Uncategorized Lessons Section */}
                                    {lessons.filter(l => !l.lessonSection && !l.section).length > 0 && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                                            <div className="p-5 flex justify-between items-center bg-amber-100/50">
                                                <div>
                                                    <h3 className="font-bold text-amber-800 text-lg flex items-center gap-2">
                                                        <AlertCircle size={20} />
                                                        دروس غير مصنفة
                                                    </h3>
                                                    <p className="text-xs text-amber-600">
                                                        هذه الدروس لا تنتمي لأي وحدة (ربما تم إنشاؤها قبل التحديث الأخير)
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                {lessons.filter(l => !l.lessonSection && !l.section).map((lesson, lessonIdx) => (
                                                    <div key={lesson._id} className="group flex items-center justify-between p-2.5 md:p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-amber-100 transition-all">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                                                                {lesson.type === 'video' ? <PlayCircle size={14} className="md:w-4 md:h-4" /> : <FileText size={14} className="md:w-4 md:h-4" />}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <h4 className="font-bold text-gray-700 text-xs md:text-sm truncate">
                                                                    {lessonIdx + 1}. {lesson.title}
                                                                </h4>
                                                                <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                                                                    {lesson.type === 'video' ? 'فيديو' : 'نص'} • {lesson.isFree ? 'مجاني' : 'مدفوع'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 md:gap-2 shrink-0">
                                                             <button 
                                                                 onClick={() => setMovingLessonId(lesson._id)}
                                                                 className="p-1.5 hover:bg-amber-100 rounded text-amber-600 hover:text-amber-800 text-xs font-bold"
                                                             >
                                                                 نقل
                                                             </button>
                                                             <button 
                                                                onClick={() => openEditLessonModal(lesson)}
                                                                className="p-1.5 hover:bg-white rounded text-blue-400 hover:text-blue-600"
                                                             >
                                                                 <Edit size={14} />
                                                             </button>
                                                             <button 
                                                                onClick={() => handleDeleteLesson(lesson._id)}
                                                                className="p-1.5 hover:bg-red-100 rounded text-red-400 hover:text-red-500"
                                                             >
                                                                 <Trash2 size={14} />
                                                             </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                         <div className="bg-white p-4 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                             <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">تفاصيل الكورس</h2>
                             <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">اسم الكورس</label>
                                        <input 
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                                        <textarea 
                                            value={formData.description}
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">السعر (ج.م)</label>
                                        <input 
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                            className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">الخصم (%)</label>
                                        <input 
                                            type="number"
                                            value={formData.discount}
                                            onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                                            className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-between items-center text-sm pt-2 border-t border-gray-200/50">
                                       <span className="text-gray-500 font-medium">السعر النهائي:</span>
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
                                        <label className="block text-sm font-bold text-gray-700 mb-2">صورة الكورس</label>
                                        <div className="relative group">
                                            <input 
                                                type="file"
                                                id="poster-upload-settings"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            
                                            {!formData.poster ? (
                                                <label 
                                                    htmlFor="poster-upload-settings"
                                                    className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all"
                                                >
                                                    <UploadCloud className="w-6 h-6 text-purple-600 mb-1" />
                                                    <p className="text-xs text-gray-500 font-medium">اضغط لرفع صورة</p>
                                                </label>
                                            ) : (
                                                <div className="relative w-full h-[120px] rounded-xl overflow-hidden border border-gray-200 group-hover:border-purple-500 transition-all">
                                                    <img 
                                                        src={getImageUrl(formData.poster)} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                                        <label 
                                                            htmlFor="poster-upload-settings"
                                                            className="p-1.5 bg-white/90 rounded-lg cursor-pointer hover:bg-white hover:text-purple-600 transition-colors shadow-lg"
                                                            title="تغيير الصورة"
                                                        >
                                                            <Edit size={16} />
                                                        </label>
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
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البداية</label>
                                            <input 
                                                type="date"
                                                value={formData.startDate}
                                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ النهاية</label>
                                            <input 
                                                type="date"
                                                value={formData.endDate}
                                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={settingsLoading}
                                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors shadow-xl shadow-purple-200 flex items-center justify-center gap-2"
                                >
                                    {settingsLoading ? <Loader2 className="animate-spin" /> : 'حفظ التغييرات'}
                                </button>
                             </form>
                         </div>
                    )}
                    
                    {activeTab === 'dashboard' && (
                         <div className="text-center py-20 text-gray-400">لوحة الاحصائيات قيد التطوير</div>
                    )}
                     {activeTab === 'students' && (
                         <div className="text-center py-20 text-gray-400">قائمة الطلاب قيد التطوير</div>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>

        {/* Create Section Modal */}
        <AnimatePresence>
            {isSectionModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setIsSectionModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-[95%] max-w-lg h-fit max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 p-6 md:p-8"
                    >
                         <h2 className="text-xl font-bold text-gray-800 mb-6">{editingSectionId ? 'تعديل الوحدة / الفصل' : 'إضافة وحدة جديدة'}</h2>
                         <form onSubmit={handleCreateSection}>
                             <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الوحدة / الفصل</label>
                                <input 
                                    required
                                    value={sectionFormData.name}
                                    onChange={e => setSectionFormData({...sectionFormData, name: e.target.value})}
                                    placeholder="مثال: الوحدة الأولى: مقدمة في البرمجة"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">السعر (ج.م)</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        value={sectionFormData.price}
                                        onChange={e => setSectionFormData({...sectionFormData, price: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">اتركه 0 إذا كان مجاني أو ضمن اشتراك الكورس</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">الخصم (%)</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={sectionFormData.discount}
                                        onChange={e => setSectionFormData({...sectionFormData, discount: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                             </div>

                             <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsSectionModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit"
                                    disabled={sectionLoading}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {sectionLoading ? <Loader2 className="animate-spin" size={18} /> : (editingSectionId ? 'حفظ التغييرات' : 'إضافة الوحدة')}
                                </button>
                             </div>
                         </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Create Lesson Modal */}
        <AnimatePresence>
            {isLessonModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setIsLessonModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-[95%] max-w-lg h-fit max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 p-6 md:p-8 scrollbar-hide"
                    >
                         <h2 className="text-xl font-bold text-gray-800 mb-6">{editingLessonId ? 'تعديل الدرس' : 'إضافة درس جديد'}</h2>
                         <form onSubmit={handleCreateLesson}>
                             <div className="space-y-4 mb-6">
                                {/* Poster Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">صورة الدرس (اختياري)</label>
                                    <div className="relative group">
                                        <input 
                                            type="file"
                                            id="lesson-poster-upload"
                                            accept="image/*"
                                            onChange={handleLessonPosterChange}
                                            className="hidden"
                                        />
                                        {!lessonFormData.poster ? (
                                            <label 
                                                htmlFor="lesson-poster-upload"
                                                className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all"
                                            >
                                                <UploadCloud className="w-5 h-5 text-purple-600 mb-1" />
                                                <p className="text-[10px] text-gray-500 font-medium">اضغط لرفع صورة</p>
                                            </label>
                                        ) : (
                                            <div className="relative w-full h-[100px] rounded-xl overflow-hidden border border-gray-200 group-hover:border-purple-500 transition-all">
                                                <img 
                                                    src={getImageUrl(lessonFormData.poster)} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <label 
                                                    htmlFor="lesson-poster-upload"
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                >
                                                    <Edit size={16} className="text-white" />
                                                </label>
                                            </div>
                                        )}
                                        {lessonUploadLoading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-20">
                                                <Loader2 className="animate-spin text-purple-600" size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الدرس <span className="text-red-500">*</span></label>
                                    <input 
                                        required
                                        value={lessonFormData.title}
                                        onChange={e => setLessonFormData({...lessonFormData, title: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">وصف الدرس</label>
                                    <textarea 
                                        value={lessonFormData.description}
                                        onChange={e => setLessonFormData({...lessonFormData, description: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all min-h-[80px]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">مدة الفيديو (دقيقة)</label>
                                        <input 
                                            type="number"
                                            value={lessonFormData.duration}
                                            onChange={e => setLessonFormData({...lessonFormData, duration: Number(e.target.value)})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">مزود الفيديو</label>
                                        <select
                                            value={lessonFormData.videoProvider}
                                            onChange={e => setLessonFormData({...lessonFormData, videoProvider: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                                        >
                                            <option value="youtube">YouTube</option>
                                            <option value="vimeo">Vimeo</option>
                                            <option value="server">Server Upload</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">سعر الدرس (ج.م)</label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={lessonFormData.price}
                                            onChange={e => setLessonFormData({...lessonFormData, price: Number(e.target.value)})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">اتركه 0 إذا كان مجاني أو ضمن الاشتراك</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">الخصم (%)</label>
                                        <input 
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={lessonFormData.discount}
                                            onChange={e => setLessonFormData({...lessonFormData, discount: Number(e.target.value)})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">رابط الفيديو</label>
                                    <input 
                                        value={lessonFormData.videoUrl}
                                        onChange={e => setLessonFormData({...lessonFormData, videoUrl: e.target.value})}
                                        placeholder="https://..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" onClick={() => setLessonFormData({...lessonFormData, isFree: !lessonFormData.isFree})}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${lessonFormData.isFree ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                                            {lessonFormData.isFree && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                        <span className="font-bold text-gray-700">درس مجاني (معاينة)</span>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" onClick={() => setLessonFormData({...lessonFormData, status: lessonFormData.status === 'active' ? 'draft' : 'active'})}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${lessonFormData.status === 'active' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                                            {lessonFormData.status === 'active' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                        <span className="font-bold text-gray-700">نشر الدرس فوراً</span>
                                    </div>
                                </div>
                             </div>
                             
                             <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsLessonModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit"
                                    disabled={lessonLoading}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {lessonLoading ? <Loader2 className="animate-spin" size={18} /> : 'إضافة الدرس'}
                                </button>
                             </div>
                         </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        {/* Move Lesson Modal */}
        <AnimatePresence>
            {movingLessonId && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setMovingLessonId(null)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-[95%] max-w-sm h-fit bg-white rounded-3xl shadow-2xl z-50 p-6"
                    >
                         <h2 className="text-xl font-bold text-gray-800 mb-4">نقل الدرس إلى...</h2>
                         <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {sections.map(section => (
                                <button
                                    key={section._id}
                                    onClick={() => handleMoveLesson(section._id)}
                                    className="w-full text-right p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all flex items-center justify-between group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-purple-700">{section.name}</span>
                                    <ChevronRight className="rotate-180 text-gray-300 group-hover:text-purple-400" size={18} />
                                </button>
                            ))}
                         </div>
                         <button 
                            onClick={() => setMovingLessonId(null)}
                            className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            إلغاء
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
}
