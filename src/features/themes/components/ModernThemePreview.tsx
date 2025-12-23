import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  siteName: string;
  subdomain: string;
  themeColor: string;
}

export const ModernThemePreview = ({ siteName, themeColor }: Omit<ThemePreviewProps, "subdomain">) => {
  // Handles hex codes directly
  const primaryStyle = { backgroundColor: themeColor || '#2563eb' };
  const textStyle = { color: themeColor || '#2563eb' };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-3 border-b">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md" style={primaryStyle}></div>
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
                Learn with <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600" style={textStyle}>{siteName || "Expertise"}</span>
            </h1>
            <p className="text-xs text-gray-500">
                Join our platform to master new skills. Modern learning for a modern world.
            </p>
            <button className="px-4 py-1.5 rounded-full text-xs font-medium text-white shadow-md transition-transform active:scale-95" style={primaryStyle}>
                Get Started
            </button>
        </div>
      </div>
      
      {/* Footer mimic */}
      <div className="h-2 bg-gray-100 border-t"></div>
    </div>
  );
};
