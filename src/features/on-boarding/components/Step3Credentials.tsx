import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const Step3Credentials = () => {
  const { register, formState: { errors } } = useFormContext<TeacherRegistrationData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
       <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
         تأمين الحساب
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
          <div className="relative group">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-12 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="••••••••"
            />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
           <div className="relative group">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                 type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-12 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="••••••••"
            />
            <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>
      </div>
    </div>
  );
};
