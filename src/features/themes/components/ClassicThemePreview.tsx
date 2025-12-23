import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  siteName: string;
  subdomain: string;
  themeColor: string;
}

export const ClassicThemePreview = ({ siteName, themeColor }: Omit<ThemePreviewProps, "subdomain">) => {
  const primaryStyle = { backgroundColor: themeColor || '#1e40af' };

  return (
    <div className="w-full h-full bg-[#f8f9fa] rounded-lg shadow-sm border overflow-hidden flex flex-col font-serif">
      {/* Header */}
      <header className="p-4 text-white text-center" style={primaryStyle}>
        <h2 className="text-lg font-bold uppercase tracking-widest">{siteName || "ACADEMY"}</h2>
        <p className="text-[0.6rem] opacity-80 uppercase tracking-wide">Since 2024</p>
      </header>
      
      {/* Nav */}
      <div className="bg-white shadow-sm py-2 flex justify-center gap-4 text-[0.6rem] uppercase tracking-wider text-gray-600 border-b">
        <span>Home</span>
        <span>Curriculum</span>
        <span>Faculty</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <h1 className="text-lg text-gray-800 font-medium">Excellence in Education</h1>
        <div className="w-10 h-0.5 opacity-50" style={primaryStyle}></div>
        <p className="text-[0.65rem] text-gray-500 max-w-[200px] leading-relaxed">
            Providing top-tier educational resources for dedicated students. Commit to your future today.
        </p>
         <button className={cn("mt-2 px-5 py-1.5 border border-gray-900 text-[0.6rem] uppercase hover:bg-gray-900 hover:text-white transition-colors duration-300")}>
            View Catalog
        </button>
      </div>
    </div>
  );
};
