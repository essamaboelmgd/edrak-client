
import React from 'react';
import { ThemeProps } from '../types';

export const CreativeTheme: React.FC<ThemeProps> = ({ primaryColor, secondaryColor, platformName }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-sm text-white">
      {/* Header */}
      <header className="px-4 py-4 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})` }}></div>
        <h1 className="font-black text-xl z-10 relative italic">{platformName || 'اسم المنصة'}</h1>
      </header>
      
      {/* Hero */}
      <div className="p-8 relative">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -mr-10 -mt-10" style={{ backgroundColor: primaryColor }}></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-10 -ml-10 -mb-10" style={{ backgroundColor: secondaryColor }}></div>
        
        <h2 className="text-2xl font-black mb-2 leading-tight z-10 relative">أطلق العنان<br/><span style={{ color: secondaryColor }}>لإبداعك</span></h2>
        
        <button 
          className="mt-4 w-full py-2 rounded-lg font-bold text-xs transform hover:scale-105 transition-transform"
          style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
        >
          ابدأ رحلتك
        </button>
      </div>

      {/* Cards */}
      <div className="p-4 flex-1 grid grid-cols-2 gap-2">
         <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: primaryColor }}></div>
            <div className="h-2 w-2/3 bg-slate-600 rounded"></div>
         </div>
         <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: secondaryColor }}></div>
            <div className="h-2 w-2/3 bg-slate-600 rounded"></div>
         </div>
      </div>
    </div>
  );
};
