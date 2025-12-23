import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  siteName: string;
  themeColor: string;
  secondaryColor?: string;
}

export const CreativeThemePreview = ({ siteName, themeColor, secondaryColor }: ThemePreviewProps) => {
  const primaryStyle = { backgroundColor: themeColor || '#3b82f6' };
  const secondaryStyle = { backgroundColor: secondaryColor || '#eab308' };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col font-mono relative">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20" style={primaryStyle}></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full opacity-20" style={secondaryStyle}></div>
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center z-10">
        <h2 className="text-xl font-black tracking-tighter">{siteName || "CREATIVE"}</h2>
        <div className="w-8 h-8 rounded-full border-2 border-black" style={secondaryStyle}></div>
      </header>
      
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 animate-pulse">
            Design Your Future
        </h1>
        <p className="text-xs text-gray-500 mt-2 mb-4 max-w-[180px]">
            Unlocked potential through creative learning pathways.
        </p>
        <button className={cn("px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-xs bg-white active:bg-gray-50")}>
            Start Creating
        </button>
      </div>
    </div>
  );
};
