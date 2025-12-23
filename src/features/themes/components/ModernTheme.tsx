
import React from 'react';
import { ThemeProps } from '../types';

export const ModernTheme: React.FC<ThemeProps> = ({ primaryColor, secondaryColor, platformName }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 border rounded-lg overflow-hidden shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="px-4 py-3 flex justify-between items-center text-white" style={{ backgroundColor: primaryColor }}>
        <h1 className="font-bold text-sm tracking-wide">{platformName || 'اسم المنصة'}</h1>
        <nav className="space-x-2 space-x-reverse text-xs opacity-90">
          <span>الرئيسية</span>
          <span>الدورات</span>
        </nav>
      </header>
      
      {/* Hero Section */}
      <div className="bg-white p-6 flex flex-col items-center text-center space-y-3 border-b">
        <div className="w-12 h-12 rounded-full mb-2 bg-slate-100 flex items-center justify-center text-xl">🎓</div>
        <h2 className="text-lg font-bold text-slate-800">تعلم بذكاء</h2>
        <p className="text-xs text-slate-500 max-w-[200px]">أفضل منصة تعليمية لتطوير مهاراتك</p>
        <button 
          className="px-4 py-1.5 rounded-full text-xs font-medium text-white shadow-sm mt-2"
          style={{ backgroundColor: secondaryColor }}
        >
          اشترك الآن
        </button>
      </div>

      {/* Content Preview */}
      <div className="p-4 grid grid-cols-2 gap-3 flex-1 overflow-hidden">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded p-2 border shadow-sm">
            <div className="h-16 bg-slate-100 rounded mb-2 w-full"></div>
            <div className="h-3 w-3/4 bg-slate-200 rounded mb-1"></div>
            <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
