import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  siteName: string;
  subdomain: string;
  themeColor: string;
}

export const ModernThemePreview = ({ siteName, themeColor }: Omit<ThemePreviewProps, "subdomain">) => {
  // Map themeColor ID (e.g. "blue") to actual utility classes if needed, 
  // or assume themeColor passed is already a class or color code.
  // In Step4, we used IDs like "blue", "purple". Let's map them to background classes.
  
  const colorMap: Record<string, string> = {
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
    orange: "bg-orange-600",
    slate: "bg-slate-600",
  };

  const bgColor = colorMap[themeColor] || "bg-blue-600";

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-3 border-b">
        <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-md", bgColor)}></div>
            <span className="font-bold text-sm tracking-tight">{siteName || "Academy Name"}</span>
        </div>
        <nav className="hidden sm:flex gap-2 text-xs text-gray-500">
            <span>Home</span>
            <span>Courses</span>
            <span>About</span>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="flex-1 p-6 flex items-center justify-center bg-gray-50 text-center">
        <div className="space-y-3 max-w-xs">
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                Learn with <span className={cn("bg-clip-text text-transparent bg-gradient-to-r from-gray-900", themeColor === 'blue' ? "to-blue-600" : `to-${themeColor}-600`)}>{siteName || "Expertise"}</span>
            </h1>
            <p className="text-xs text-gray-500">
                Join our platform to master new skills. Modern learning for a modern world.
            </p>
            <button className={cn("px-4 py-1.5 rounded-full text-xs font-medium text-white shadow-md transition-transform active:scale-95", bgColor)}>
                Get Started
            </button>
        </div>
      </div>
      
      {/* Footer mimic */}
      <div className="h-2 bg-gray-100 border-t"></div>
    </div>
  );
};
