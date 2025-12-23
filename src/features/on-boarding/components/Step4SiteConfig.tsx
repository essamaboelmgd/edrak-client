import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";
import { cn } from "@/lib/utils";
import { ModernThemePreview } from "@/features/themes/components/ModernThemePreview";
import { ClassicThemePreview } from "@/features/themes/components/ClassicThemePreview";
import { CreativeThemePreview } from "@/features/themes/components/CreativeThemePreview";

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
  const secondaryColor = watch("secondaryColor");
  const templateId = watch("templateId");
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex flex-wrap gap-2">
                {THEMES.map(theme => (
                    <button
                        key={theme.id}
                        type="button"
                        onClick={() => setValue("themeColor", theme.id)}
                        className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            theme.color,
                            currentTheme === theme.id ? "border-black ring-2 ring-offset-2 ring-blue-400 scale-110" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                    />
                ))}
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">Secondary Color (Optional)</label>
            <div className="flex flex-wrap gap-2">
                {THEMES.map(theme => (
                    <button
                        key={theme.id}
                        type="button"
                        onClick={() => setValue("secondaryColor", theme.id)}
                        className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            theme.color,
                            secondaryColor === theme.id ? "border-black ring-2 ring-offset-2 ring-gray-400 scale-110" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                    />
                ))}
            </div>
        </div>
      </div>
      {errors.themeColor && <p className="text-sm text-red-500">{errors.themeColor.message}</p>}

      {/* Template Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Choose Template</label>
        <div className="grid grid-cols-3 gap-3">
            <div 
                className={cn("border-2 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition", templateId === "modern" ? "border-blue-600 bg-blue-50" : "border-gray-200")}
                onClick={() => setValue("templateId", "modern")}
            >
                <div className="h-16 bg-gray-200 mb-2 rounded"></div>
                <p className="font-semibold text-center text-xs">Modern</p>
            </div>
            <div 
                className={cn("border-2 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition", templateId === "classic" ? "border-blue-600 bg-blue-50" : "border-gray-200")}
                onClick={() => setValue("templateId", "classic")}
            >
                <div className="h-16 bg-gray-200 mb-2 rounded"></div>
                <p className="font-semibold text-center text-xs">Classic</p>
            </div>
            <div 
                className={cn("border-2 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition", templateId === "creative" ? "border-blue-600 bg-blue-50" : "border-gray-200")}
                onClick={() => setValue("templateId", "creative")}
            >
                <div className="h-16 bg-gray-200 mb-2 rounded border-black border"></div>
                <p className="font-semibold text-center text-xs">Creative</p>
            </div>
        </div>
        <input type="hidden" {...register("templateId")} />
        {errors.templateId && <p className="text-sm text-red-500">{errors.templateId.message}</p>}
      </div>

      {/* Live Preview Section */}
      <div className="mt-8 border-t pt-6">
        <label className="text-sm font-medium mb-4 block">Live Preview</label>
        <div className="w-full aspect-video rounded-xl border shadow-lg overflow-hidden bg-gray-50 ring-1 ring-gray-900/5 items-center justify-center flex">
            {templateId === "modern" && (
                <ModernThemePreview 
                    siteName={watch("siteName")} 
                    themeColor={currentTheme} 
                />
            )}
            {templateId === "classic" && (
                <ClassicThemePreview 
                    siteName={watch("siteName")} 
                    themeColor={currentTheme} 
                />
            )}
             {templateId === "creative" && (
                <CreativeThemePreview 
                    siteName={watch("siteName")} 
                    themeColor={currentTheme} 
                    secondaryColor={secondaryColor}
                />
            )}
            {!templateId && <p className="text-sm text-gray-500">Select a template to view preview</p>}
        </div>
      </div>
      
    </div>
  );
};
