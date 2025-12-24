import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { client } from '@/api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await client.post('/auth/login', { mobileNumber, password });
      
      const token = response.data?.data?.token || response.data?.token;
      
      if (token) {
        localStorage.setItem('token', token);
        navigate('/app'); 
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // More specific error handling
      if (err.response?.status === 404) {
          setError('رقم الموبايل غير مسجل');
      } else if (err.response?.status === 400) {
          setError('رقم الموبايل أو كلمة المرور غير صحيحة');
      } else {
          setError(err.response?.data?.message || 'Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              مرحباً بك مجدداً
            </h1>
            <p className="text-gray-500">سجل دخولك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-4">
              <div className="relative group">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="رقم الموبايل"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-12 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm flex-row-reverse">
               <a href="#" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                نسيت كلمة المرور؟
              </a>
              <label className="flex items-center gap-2 cursor-pointer group flex-row-reverse">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="text-gray-500 group-hover:text-gray-700 transition-colors">تذكرني</span>
              </label>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 justify-end"
              >
                 {error} <span>⚠️</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  تسجيل الدخول <ArrowRight size={20} className="rotate-180" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            ليس لديك حساب؟{' '}
            <a href="/signup" className="font-bold text-purple-600 hover:text-purple-800 transition-colors">
              إنشاء حساب جديد
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right Column - Visual/Image */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 relative p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-blue-600/90 mix-blend-multiply z-10" />
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
          alt="Login Visual" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 text-white max-w-lg text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 0.6 }}
           >
              <h2 className="text-4xl font-bold mb-6">Empower Your Learning Journey</h2>
              <p className="text-lg text-white/80 leading-relaxed">
                 Manage your students, track progress, and organize your content with the most advanced educational platform.
              </p>
              
              {/* Floating Cards Effect */}
              <div className="mt-12 relative h-48 w-full flex justify-center">
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl w-64 top-0 -left-4"
                 >
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">✓</div>
                       <div className="text-sm font-medium">Class Completed</div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden">
                       <div className="h-full bg-green-400 w-3/4"></div>
                    </div>
                 </motion.div>

                 <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl w-56 bottom-0 right-0"
                 >
                     <div className="text-3xl font-bold">98%</div>
                     <div className="text-sm text-white/70">Student Satisfaction</div>
                 </motion.div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
