import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Lock, BookOpen, MapPin, Loader2 } from 'lucide-react';
import { client } from '@/api/client';

export default function StudentSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    educationalLevel: '',
    governorate: 'Cairo', // Default
    gender: 'male',
    parentInfo: {
      parentName: '',
      parentMobile: ''
    }
  });

  const governorates = [
    "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum", "Gharbiya", "Ismailia", "Menofia", "Minya", "Qaliubiya", "New Valley", "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharkia", "South Sinai", "Kafr Al-Sheikh", "Matrouh", "Luxor", "Qena", "North Sinai", "Sohag"
  ];

  // Fetch educational levels if needed, or hardcode/select
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  useEffect(() => {
    // Fetch educational levels
    const fetchLevels = async () => {
      try {
        const res = await client.get('/educational-levels');
        // Handle grouped response { primary: [], preparatory: [], secondary: [] }
        const data = res.data?.data?.educationalLevels;
        
        if (data && !Array.isArray(data)) {
             // It's grouped, flatten it
             const flattened = [
                 ...(data.primary || []),
                 ...(data.preparatory || []),
                 ...(data.secondary || [])
             ].sort((a, b) => a.order - b.order);
             setAcademicYears(flattened);
        } else if (Array.isArray(data)) {
             setAcademicYears(data);
        } else if (Array.isArray(res.data?.data)){
             setAcademicYears(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch levels", err);
      }
    };
    fetchLevels();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith('parent_')) {
        const field = name.replace('parent_', '');
        setFormData(prev => ({
            ...prev,
            parentInfo: { ...prev.parentInfo, [field]: value }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await client.post('/auth/student/signup', formData);
      navigate('/login'); // Redirect to login after success
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-bl-full opacity-50"></div>
         <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-100 rounded-tr-full opacity-50"></div>

         <div className="text-center relative z-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            إنشاء حساب طالب جديد
          </h2>
          <p className="mt-2 text-gray-500">سجل بياناتك للوصول إلى المحتوى التعليمي</p>
        </div>

        <form className="mt-8 space-y-6 relative z-10 text-right" dir="rtl" onSubmit={handleSubmit}>
           {/* Personal Info */}
           <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                   <User size={20} className="text-purple-600" /> البيانات الشخصية
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input name="firstName" required placeholder="الاسم الأول" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200" />
                  <input name="middleName" required placeholder="اسم الأب" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200" />
                  <input name="lastName" required placeholder="اسم العائلة" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="relative">
                      <Phone className="absolute right-3 top-3 text-gray-400" size={18} />
                      <input name="mobileNumber" required type="tel" placeholder="رقم الموبايل" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 outline-none focus:ring-2 focus:ring-purple-200" />
                   </div>
                   <input name="email" required type="email" placeholder="البريد الإلكتروني" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200" />
               </div>

                <div className="relative">
                    <Lock className="absolute right-3 top-3 text-gray-400" size={18} />
                    <input name="password" required type="password" placeholder="كلمة المرور" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
           </div>

           {/* Education & Location */}
           <div className="space-y-4 pt-4 border-t border-gray-100">
               <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                   <BookOpen size={20} className="text-purple-600" /> البيانات الدراسية
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="relative">
                       <select name="educationalLevel" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200 appearance-none">
                           <option value="">اختر الصف الدراسي</option>
                           {academicYears.map((year: any) => (
                               <option key={year._id} value={year._id}>{year.name}</option>
                           ))}
                       </select>
                   </div>
                   
                   <div className="relative">
                       <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
                       <select name="governorate" required onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 outline-none focus:ring-2 focus:ring-purple-200 appearance-none">
                           {governorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                       </select>
                   </div>
               </div>
           </div>

           {/* Parent Info */}
           <div className="space-y-4 pt-4 border-t border-gray-100">
               <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                   <User size={20} className="text-purple-600" /> بيانات ولي الأمر
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="parent_parentName" required placeholder="اسم ولي الأمر" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200" />
                  <input name="parent_parentMobile" required type="tel" placeholder="رقم موبايل ولي الأمر" onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200" />
               </div>
           </div>

           {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
                  ⚠️ {error}
              </div>
           )}

           <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : 'إنشاء الحساب'}
            </button>
            
            <p className="text-center text-sm text-gray-500">
                باستخدامك للمنصة، أنت توافق على <a href="#" className="text-purple-600 font-bold">الشروط والأحكام</a>
            </p>
        </form>
      </motion.div>
    </div>
  );
}
