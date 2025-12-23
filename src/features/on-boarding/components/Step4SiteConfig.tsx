import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";
import { cn } from "@/lib/utils";
import { ModernThemePreview } from "@/features/themes/components/ModernThemePreview";
import { ClassicThemePreview } from "@/features/themes/components/ClassicThemePreview";

const THEMES = [
  { id: "blue", color: "bg-blue-600" },
  { id: "purple", color: "bg-purple-600" },
  { id: "green", color: "bg-green-600" },
  { id: "orange", color: "bg-orange-600" },
  { id: "slate", color: "bg-slate-600" },
] as const;

export const Step4SiteConfig = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<TeacherRegistrationData>();
  
  const currentTheme = watch("themeColor");
  const subdomain = watch("subdomain");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label className="text-sm font-medium">Academy Name</label>
        <input 
          {...register("siteName")}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="New Generation Academy"
        />
        {errors.siteName && <p className="text-sm text-red-500">{errors.siteName.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Subdomain URL</label>
        <div className="flex items-center">
            <input 
            {...register("subdomain")}
            className="flex h-10 w-full rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:z-10"
            placeholder="mr-ahmed"
            />
            <div className="bg-gray-100 text-gray-500 px-3 py-2 border border-l-0 rounded-r-md h-10 flex items-center text-sm">
                .edrak.com
            </div>
        </div>
        {subdomain && <p className="text-xs text-muted-foreground mt-1">Your site will be at: <span className="font-mono font-medium text-blue-600">https://{subdomain}.edrak.com</span></p>}
        {errors.subdomain && <p className="text-sm text-red-500">{errors.subdomain.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Theme Color</label>
        <div className="flex gap-4">
            {THEMES.map(theme => (
                <button
                    key={theme.id}
                    type="button"
                    onClick={() => setValue("themeColor", theme.id)}
                    className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all",
                        theme.color,
                        currentTheme === theme.id ? "border-black ring-2 ring-offset-2 ring-blue-400 scale-110" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                />
            ))}
        </div>
        <p className="text-xs text-gray-500">Select the primary color for your landing page.</p>
      </div>

      {/* Template Selection Placeholder */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Choose Template</label>
        <div className="grid grid-cols-2 gap-4">
            <div 
                className={cn("border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition", watch("templateId") === "modern" ? "border-blue-600 bg-blue-50" : "border-gray-200")}
                onClick={() => setValue("templateId", "modern")}
            >
                <div className="h-20 bg-gray-200 mb-2 rounded"></div>
                <p className="font-semibold text-center">Modern</p>
            </div>
            <div 
                className={cn("border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition", watch("templateId") === "classic" ? "border-blue-600 bg-blue-50" : "border-gray-200")}
                onClick={() => setValue("templateId", "classic")}
            >
                <div className="h-20 bg-gray-200 mb-2 rounded"></div>
                <p className="font-semibold text-center">Classic</p>
            </div>
        </div>
        <input type="hidden" {...register("templateId")} />
        {errors.templateId && <p className="text-sm text-red-500">{errors.templateId.message}</p>}
      </div>
      {/* Live Preview Section */}
      <div className="mt-8 border-t pt-6">
        <label className="text-sm font-medium mb-4 block">Live Preview</label>
        <div className="w-full aspect-video rounded-xl border shadow-lg overflow-hidden bg-gray-50 ring-1 ring-gray-900/5 items-center justify-center flex">
            {watch("templateId") === "modern" ? (
                <ModernThemePreview 
                    siteName={watch("siteName")} 
                    themeColor={currentTheme} 
                />
            ) : (
                <ClassicThemePreview 
                    siteName={watch("siteName")} 
                    themeColor={currentTheme} 
                />
            )}
        </div>
      </div>
      
    </div>
  );
};
