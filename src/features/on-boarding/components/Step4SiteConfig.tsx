import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";
import { cn } from "@/lib/utils";
import { ThemeRenderer, THEME_REGISTRY } from "../../themes";
import { useEffect } from "react";

const PRIMARY_COLORS = [
  { id: "#2563EB", label: "Blue", class: "bg-blue-600" }, // blue-600
  { id: "#9333EA", label: "Purple", class: "bg-purple-600" }, // purple-600
  { id: "#16A34A", label: "Green", class: "bg-green-600" }, // green-600
  { id: "#EA580C", label: "Orange", class: "bg-orange-600" }, // orange-600
  { id: "#0F172A", label: "Slate", class: "bg-slate-900" }, // slate-900
];

const SECONDARY_COLORS = [
  { id: "#60A5FA", label: "Light Blue", class: "bg-blue-400" },
  { id: "#C084FC", label: "Light Purple", class: "bg-purple-400" },
  { id: "#4ADE80", label: "Light Green", class: "bg-green-400" },
  { id: "#FDBA74", label: "Light Orange", class: "bg-orange-300" },
  { id: "#E2E8F0", label: "Light Slate", class: "bg-slate-200" },
];

export const Step4SiteConfig = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<TeacherRegistrationData>();
  
  // Watch values for preview
  const platformName = watch("siteName");
  const subdomain = watch("subdomain");
  // Map old themeColor to primaryColor if needed, or just use registered fields
  const primaryColor = watch("primaryColor") || "#2563EB"; 
  const secondaryColor = watch("secondaryColor") || "#60A5FA";
  const templateId = watch("templateId") || "modern";

  // Set default colors if not set
  useEffect(() => {
    if (!watch("primaryColor")) setValue("primaryColor", "#2563EB");
    if (!watch("secondaryColor")) setValue("secondaryColor", "#60A5FA");
    if (!watch("templateId")) setValue("templateId", "modern");
  }, [setValue, watch]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Right Column: Configuration Form */}
      <div className="flex-1 space-y-6 order-2 lg:order-1">
        
        {/* Basic Info */}
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">اسم الأكاديمية (المنصة)</label>
                <input 
                {...register("siteName")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="أكاديمية المستقبل"
                dir="auto"
                />
                {errors.siteName && <p className="text-sm text-red-500">{errors.siteName.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">رابط المنصة (Subdomain)</label>
                <div className="flex items-center" dir="ltr">
                    <input 
                    {...register("subdomain")}
                    className="flex h-10 w-full rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:z-10"
                    placeholder="academy-name"
                    />
                    <div className="bg-gray-100 text-gray-500 px-3 py-2 border border-l-0 rounded-r-md h-10 flex items-center text-sm font-mono whitespace-nowrap">
                        .edrak.com
                    </div>
                </div>
                {errors.subdomain && <p className="text-sm text-red-500 text-right">{errors.subdomain.message}</p>}
            </div>
        </div>

        <hr className="border-gray-100" />

        {/* Template Selection */}
        <div className="space-y-3">
            <label className="text-sm font-medium">اختر القالب</label>
            <div className="grid grid-cols-3 gap-3">
                {Object.values(THEME_REGISTRY).map((theme) => (
                    <div 
                        key={theme.id}
                        onClick={() => setValue("templateId", theme.id)}
                        className={cn(
                            "cursor-pointer rounded-lg border-2 p-2 hover:border-blue-400 transition-all text-center",
                            templateId === theme.id ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200"
                        )}
                    >
                        <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center text-lg font-bold text-gray-400">
                            {theme.thumbnail}
                        </div>
                        <span className="text-xs font-medium">{theme.name}</span>
                    </div>
                ))}
            </div>
            <input type="hidden" {...register("templateId")} />
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">اللون الأساسي</label>
                <div className="flex flex-wrap gap-3">
                    {PRIMARY_COLORS.map(color => (
                        <button
                            key={color.id}
                            type="button"
                            onClick={() => setValue("primaryColor", color.id)}
                            className={cn(
                                "w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110",
                                color.class,
                                primaryColor === color.id && "ring-2 ring-offset-2 ring-blue-600 scale-110"
                            )}
                            title={color.label}
                        />
                    ))}
                    <input 
                        type="color" 
                        className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        value={primaryColor}
                        onChange={(e) => setValue("primaryColor", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">اللون الثانوي</label>
                <div className="flex flex-wrap gap-3">
                    {SECONDARY_COLORS.map(color => (
                        <button
                            key={color.id}
                            type="button"
                            onClick={() => setValue("secondaryColor", color.id)}
                            className={cn(
                                "w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110",
                                color.class,
                                secondaryColor === color.id && "ring-2 ring-offset-2 ring-blue-600 scale-110"
                            )}
                            title={color.label}
                        />
                    ))}
                     <input 
                        type="color" 
                        className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        value={secondaryColor}
                         onChange={(e) => setValue("secondaryColor", e.target.value)}
                    />
                </div>
            </div>
        </div>

      </div>

      {/* Left Column: Live Preview */}
      <div className="flex-1 order-1 lg:order-2">
        <div className="sticky top-4">
            <label className="text-sm font-medium mb-2 block text-gray-500">معاينة حية</label>
            <div className="border-[6px] border-gray-900 rounded-[2rem] overflow-hidden shadow-2xl bg-white h-[500px] relative">
                {/* Mobile Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                
                {/* Screen Content */}
                <div className="h-full w-full overflow-y-auto no-scrollbar bg-white">
                    <ThemeRenderer 
                        themeId={templateId}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        platformName={platformName}
                    />
                </div>
            </div>
             <p className="text-center text-xs text-gray-400 mt-4">شكل تقريبي للمنصة على الموبايل</p>
        </div>
      </div>

    </div>
  );
};
