import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";
import { User, MapPin } from "lucide-react";

export const Step1BasicInfo = () => {
  const { register, formState: { errors } } = useFormContext<TeacherRegistrationData>();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
         البيانات الشخصية
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">الاسم الأول</label>
          <div className="relative group">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                {...register("firstName")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="أحمد"
            />
          </div>
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">اسم الأب</label>
          <div className="relative group">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                {...register("middleName")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="محمد"
            />
          </div>
          {errors.middleName && <p className="text-xs text-red-500">{errors.middleName.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">اسم العائلة</label>
          <div className="relative group">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                {...register("lastName")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="علي"
            />
          </div>
           {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">النوع</label>
          <div className="relative">
             <select 
                {...register("gender")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right appearance-none"
             >
                <option value="">اختر...</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
             </select>
          </div>
          {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">المحافظة</label>
           <div className="relative group">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors pointer-events-none" size={18} />
            <select 
                {...register("governorate")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right appearance-none"
            >
                <option value="">اختر المحافظة</option>
                <option value="Cairo">القاهرة</option>
                <option value="Giza">الجيزة</option>
                <option value="Alexandria">الإسكندرية</option>
                <option value="Dakahlia">الدقهلية</option>
                <option value="Sharqia">الشرقية</option>
                <option value="Monufia">المنوفية</option>
                <option value="Qalyubia">القليوبية</option>
                <option value="Beheira">البحيرة</option>
                <option value="Gharbia">الغربية</option>
                <option value="Damietta">دمياط</option>
                <option value="Kafr El Sheikh">كفر الشيخ</option>
                <option value="Fayoum">الفيوم</option>
                <option value="Beni Suef">بني سويف</option>
                <option value="Minya">المنيا</option>
                <option value="Asyut">أسيوط</option>
                <option value="Sohag">سوهاج</option>
                <option value="Qena">قنا</option>
                <option value="Luxor">الأقصر</option>
                <option value="Aswan">أسوان</option>
            </select>
          </div>
          {errors.governorate && <p className="text-xs text-red-500">{errors.governorate.message}</p>}
        </div>
      </div>
    </div>
  );
};
