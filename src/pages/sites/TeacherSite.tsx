import { ModernThemePreview } from '@/features/themes/components/ModernThemePreview';
import { ClassicThemePreview } from '@/features/themes/components/ClassicThemePreview';
import { CreativeThemePreview } from '@/features/themes/components/CreativeThemePreview';

interface TeacherSiteProps {
  config: {
    platformName: string;
    theme: string;
    primaryColor?: string;
    secondaryColor?: string;
    [key: string]: any;
  }
}

export default function TeacherSite({ config }: TeacherSiteProps) {
  if (!config) return <div className="min-h-screen bg-white flex items-center justify-center">Loading Site...</div>;

  const { platformName, theme, primaryColor, secondaryColor } = config;

  // We reuse the preview components as full site wrappers for now
  if (theme === 'classic') {
    return <ClassicThemePreview siteName={platformName} themeColor={primaryColor || 'blue'} />;
  }
  
  if (theme === 'creative') {
    return <CreativeThemePreview siteName={platformName} themeColor={primaryColor || 'blue'} secondaryColor={secondaryColor} />;
  }

  // Default to Modern
  return <ModernThemePreview siteName={platformName} themeColor={primaryColor || 'blue'} />;
}
