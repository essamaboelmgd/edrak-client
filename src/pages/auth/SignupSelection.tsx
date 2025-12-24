import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, School, ArrowRight } from 'lucide-react';

export default function SignupSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          انضم إلينا اليوم
        </h1>
        <p className="text-xl text-gray-500">اختر نوع حسابك للبدء في رحلتك التعليمية</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
        {/* Student Card */}
        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/signup/student')}
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 transition-all group text-right"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors ml-auto">
            <GraduationCap size={32} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">أنا طالب</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            استمتع بتجربة تعليمية متكاملة، تابع دروسك، واختبر مستواك مع أفضل المدرسين.
          </p>
          <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-[-10px] transition-transform flex-row-reverse justify-end gap-2">
            <span>إنشاء حساب طالب</span>
            <ArrowRight size={20} className="rotate-180" />
          </div>
        </motion.div>

        {/* Teacher Card */}
        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/join')}
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 transition-all group text-right"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors ml-auto">
            <School size={32} className="text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">أنا مدرس / أكاديمية</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            أنشئ منصتك التعليمية الخاصة، أدر طلابك، وانشر محتواك بسهولة واحترافية.
          </p>
          <div className="flex items-center text-purple-600 font-bold group-hover:translate-x-[-10px] transition-transform flex-row-reverse justify-end gap-2">
            <span>إنشاء منصة تعليمية</span>
            <ArrowRight size={20} className="rotate-180" />
          </div>
        </motion.div>
      </div>
      
      <p className="mt-12 text-gray-500 z-10">
        لديك حساب بالفعل؟{' '}
        <a href="/login" className="font-bold text-purple-600 hover:text-purple-800 transition-colors">
          تسجيل الدخول
        </a>
      </p>
    </div>
  );
}
