
import React from 'react';
import { ModernTheme } from './components/ModernTheme';
import { ClassicTheme } from './components/ClassicTheme';
import { CreativeTheme } from './components/CreativeTheme';
import { ThemeConfig } from './types';

export const THEME_REGISTRY: Record<string, ThemeConfig> = {
  modern: {
    id: 'modern',
    name: 'مودرن',
    component: ModernTheme,
    thumbnail: 'M'
  },
  classic: {
    id: 'classic',
    name: 'كلاسيك',
    component: ClassicTheme,
    thumbnail: 'C'
  },
  creative: {
    id: 'creative',
    name: 'إبداعي',
    component: CreativeTheme,
    thumbnail: 'Cr'
  }
};

interface ThemeRendererProps {
  themeId: string;
  primaryColor: string;
  secondaryColor: string;
  platformName: string;
}

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ 
  themeId, 
  primaryColor, 
  secondaryColor, 
  platformName 
}) => {
  const theme = THEME_REGISTRY[themeId] || THEME_REGISTRY['modern'];
  const ThemeComponent = theme.component;

  return (
    <div className="w-full h-full relative group">
      <div className="absolute inset-0 transition-transform duration-300 transform group-hover:scale-[1.02]">
        <ThemeComponent 
          primaryColor={primaryColor} 
          secondaryColor={secondaryColor} 
          platformName={platformName} 
        />
      </div>
    </div>
  );
};
