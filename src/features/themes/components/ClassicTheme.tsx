
import React from 'react';
import { ThemeProps } from '../types';

export const ClassicTheme: React.FC<ThemeProps> = ({ primaryColor, secondaryColor, platformName }) => {
  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] border rounded-lg overflow-hidden shadow-sm font-serif">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b flex justify-between items-center">
        <h1 className="font-bold text-base text-slate-800" style={{ color: primaryColor }}>{platformName || 'اسم المنصة'}</h1>
        <nav className="space-x-3 space-x-reverse text-xs text-slate-600 font-medium">
          <span>الرئيسية</span>
          <span>من نحن</span>
        </nav>
      </header>
      
      {/* Hero */}
      <div className="p-6 text-center border-b bg-white mt-1">
        <h2 className="text-xl font-bold text-slate-900 mb-2">مرحباً بكم</h2>
        <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: secondaryColor }}></div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">بوابة العلم والمعرفة لمستقبل مشرق</p>
        <button 
          className="px-5 py-1.5 border-2 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          تصفح الدورات
        </button>
      </div>

      {/* Grid */}
      <div className="p-4 bg-slate-50 flex-1">
        <div className="space-y-3">
            <div className="flex items-center p-3 bg-white border-l-4 shadow-sm" style={{ borderLeftColor: secondaryColor }}>
                <div className="w-8 h-8 rounded-full bg-slate-100 ml-3"></div>
                <div className="flex-1">
                    <div className="h-2 w-1/2 bg-slate-200 rounded mb-1"></div>
                    <div className="h-2 w-1/4 bg-slate-100 rounded"></div>
                </div>
            </div>
            <div className="flex items-center p-3 bg-white border-l-4 shadow-sm" style={{ borderLeftColor: secondaryColor }}>
                <div className="w-8 h-8 rounded-full bg-slate-100 ml-3"></div>
                <div className="flex-1">
                    <div className="h-2 w-1/2 bg-slate-200 rounded mb-1"></div>
                    <div className="h-2 w-1/4 bg-slate-100 rounded"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
