import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans" dir="rtl">
      <Sidebar 
        isOpen={isMobileOpen} 
        onClose={() => setIsMobileOpen(false)} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative scroll-smooth">
          {/* Background Elements for subtle visual interest */}
          <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 -z-10 blur-3xl pointer-events-none"></div>
          
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
