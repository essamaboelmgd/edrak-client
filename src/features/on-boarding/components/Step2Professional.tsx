import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";
import { Mail, Phone, Briefcase, Award, PenTool } from "lucide-react";

export const Step2Professional = () => {
  const { register, formState: { errors } } = useFormContext<TeacherRegistrationData>();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
         البيانات المهنية والتواصل
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2 col-span-2 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
           <div className="relative group">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                type="email"
                {...register("email")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="your@email.com"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2 col-span-2 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">رقم الموبايل</label>
           <div className="relative group">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                type="tel"
                {...register("phone")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="010xxxxxxx"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">سنوات الخبرة</label>
           <div className="relative group">
            <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                type="number"
                {...register("yearsOfExperience")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="0"
                min="0"
            />
          </div>
          {errors.yearsOfExperience && <p className="text-xs text-red-500">{errors.yearsOfExperience.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">التخصص</label>
           <div className="relative group">
            <Award className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors pointer-events-none" size={18} />
            <select 
                {...register("specialization")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right appearance-none"
            >
                 <option value="">اختر التخصص</option>
                 <option value="Mathematics">الرياضيات</option>
                 <option value="Physics">الفيزياء</option>
                 <option value="Chemistry">الكيمياء</option>
                 <option value="Biology">الأحياء</option>
                 <option value="English">اللغة الإنجليزية</option>
                 <option value="Arabic">اللغة العربية</option>
                 <option value="History">التاريخ</option>
                 <option value="Geography">الجغرافيا</option>
                 <option value="Other">أخرى</option>
            </select>
          </div>
          {errors.specialization && <p className="text-xs text-red-500">{errors.specialization.message}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium text-gray-700">نبذة مختصرة عنك</label>
           <div className="relative group">
            <PenTool className="absolute right-3 top-3 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <textarea 
                {...register("bio")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right min-h-[100px]"
                placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك..."
            />
          </div>
          {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
        </div>
      </div>
    </div>
  );
};
