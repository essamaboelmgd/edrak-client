import { useFormContext, useWatch } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";
import { Layout, Globe, Palette } from "lucide-react";

const themes = [
    { id: 'default', name: 'الافتراضي', color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { id: 'modern', name: 'عصري', color: 'bg-gradient-to-r from-purple-500 to-pink-600' },
    { id: 'classic', name: 'كلاسيكي', color: 'bg-gradient-to-r from-slate-600 to-slate-800' },
];

const colors = [
    { id: 'blue', value: '#2563eb' },
    { id: 'purple', value: '#9333ea' },
    { id: 'green', value: '#16a34a' },
    { id: 'orange', value: '#ea580c' },
    { id: 'slate', value: '#475569' },
];

export const Step4SiteConfig = () => {
  const { register, setValue, formState: { errors } } = useFormContext<TeacherRegistrationData>();
  const selectedTheme = useWatch({ name: 'templateId' });
  const selectedColor = useWatch({ name: 'themeColor' });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
         إعدادات المنصة
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">اسم المنصة / الأكاديمية</label>
           <div className="relative group">
            <Layout className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
            <input 
                {...register("siteName")}
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                placeholder="أكاديمية النجاح"
            />
          </div>
          {errors.siteName && <p className="text-xs text-red-500">{errors.siteName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">النطاق الفرعي (Subdomain)</label>
          <div className="flex flex-row-reverse items-center gap-2">
            <div className="relative group flex-1">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                <input 
                    {...register("subdomain")}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all text-right"
                    placeholder="al-najah"
                />
            </div>
            <span className="text-gray-400 font-medium dir-ltr">.edrak.cloud</span>
          </div>
          {errors.subdomain && <p className="text-xs text-red-500">{errors.subdomain.message}</p>}
        </div>

        {/* Theme Selection */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Palette size={18} /> اختر شكل المنصة
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {themes.map((theme) => (
                    <div 
                        key={theme.id}
                        onClick={() => setValue('templateId', theme.id)}
                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${selectedTheme === theme.id ? 'border-purple-600 ring-4 ring-purple-100' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                        <div className={`h-24 ${theme.color}`}></div>
                        <div className="p-3 text-center font-bold text-gray-700">{theme.name}</div>
                    </div>
                ))}
            </div>
            {errors.templateId && <p className="text-xs text-red-500">{errors.templateId.message}</p>}
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
             <label className="text-sm font-medium text-gray-700">اللون الرئيسي</label>
             <div className="flex flex-wrap gap-4 justify-end">
                {colors.map((color) => (
                    <div
                        key={color.id}
                        onClick={() => setValue('themeColor', color.id as any)}
                        className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all ${selectedColor === color.id ? 'ring-4 ring-offset-2 ring-purple-200 scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color.value }}
                    >
                        {selectedColor === color.id && <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>}
                    </div>
                ))}
             </div>
             {errors.themeColor && <p className="text-xs text-red-500">{errors.themeColor.message}</p>}
        </div>
      </div>
    </div>
  );
};
