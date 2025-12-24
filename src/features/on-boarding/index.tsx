import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherRegistrationSchema, type TeacherRegistrationData } from "./schema";
import { authApi } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, ArrowLeft, ArrowRight } from "lucide-react";

import { Step1BasicInfo } from "./components/Step1BasicInfo";
import { Step2Professional } from "./components/Step2Professional";
import { Step3Credentials } from "./components/Step3Credentials";
import { Step4SiteConfig } from "./components/Step4SiteConfig";

const steps = [
  { id: 1, title: "البيانات الأساسية" },
  { id: 2, title: "البيانات المهنية" },
  { id: 3, title: "تأمين الحساب" },
  { id: 4, title: "إعدادات المنصة" }
];

export default function TeacherRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<TeacherRegistrationData>({
    resolver: zodResolver(teacherRegistrationSchema),
    mode: "onChange",
    defaultValues: {
        themeColor: "blue",
        templateId: "default",
        yearsOfExperience: 0
    }
  });

  const onSubmit = async (data: TeacherRegistrationData) => {
    setIsSubmitting(true);
    try {
        await authApi.registerTeacher(data);
        // Show success message or modal? For now alert and redirect
        // Ideally we should have a nice success page
        navigate("/login");
    } catch (error: any) {
        console.error(error);
        alert("Registration Failed: " + (error.response?.data?.message || error.message));
    } finally {
        setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await methods.trigger(["firstName", "middleName", "lastName", "gender", "governorate"]);
    if (step === 2) isValid = await methods.trigger(["email", "phone", "specialization", "yearsOfExperience", "bio"]);
    if (step === 3) isValid = await methods.trigger(["password", "confirmPassword"]);
    
    if (isValid) setStep(s => Math.min(s + 1, 4));
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans" dir="rtl">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10 flex flex-col md:flex-row h-[800px] md:h-[600px]"
        >
            {/* Sidebar / Progress */}
            <div className="w-full md:w-1/3 bg-gray-50/50 p-8 border-l border-gray-100 flex flex-col">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        أنشئ منصتك
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">خطوات بسيطة لبدء رحلتك التعليمية</p>
                </div>

                <div className="space-y-6 relative">
                    {/* Vertical Line */}
                    <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                    {steps.map((s) => {
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;
                        return (
                            <div key={s.id} className="relative flex items-center gap-4 z-10">
                                <motion.div 
                                    animate={{ 
                                        backgroundColor: isActive || isCompleted ? '#8B5CF6' : '#FFFF',
                                        borderColor: isActive || isCompleted ? '#8B5CF6' : '#E5E7EB',
                                        scale: isActive ? 1.1 : 1
                                    }}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isActive || isCompleted ? 'text-white shadow-lg shadow-purple-500/30' : 'text-gray-400 bg-white'}`}
                                >
                                    {isCompleted ? <Check size={16} /> : <span className="text-sm font-bold">{s.id}</span>}
                                </motion.div>
                                <div>
                                    <p className={`text-sm font-bold transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {s.title}
                                    </p>
                                    {isActive && <motion.p layoutId="activeStepParams" className="text-xs text-purple-600">قيد التنفيذ</motion.p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                <div className="mt-auto hidden md:block">
                     <p className="text-xs text-gray-400">Edrak LMS Platform &copy; 2025</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="h-full flex flex-col">
                        <div className="flex-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {step === 1 && <Step1BasicInfo />}
                                    {step === 2 && <Step2Professional />}
                                    {step === 3 && <Step3Credentials />}
                                    {step === 4 && <Step4SiteConfig />}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                             <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-all font-medium"
                            >
                                <ArrowRight size={18} /> السابق
                            </button>

                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all font-medium shadow-lg hover:shadow-xl"
                                >
                                    التالي <ArrowLeft size={18} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/30 transition-all font-medium shadow-lg hover:scale-105"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'إنشاء المنصة'}
                                </button>
                            )}
                        </div>
                    </form>
                </FormProvider>
            </div>
        </motion.div>
    </div>
  );
}
