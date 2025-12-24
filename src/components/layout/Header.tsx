import { Bell, Search, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm" dir="rtl">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Right: Mobile Menu Trigger & Search (Visually Right in RTL) */}
        <div className="flex items-center gap-4 flex-1">
          <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
             <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center w-full max-w-md relative group">
            <Search className="absolute right-3 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="بحث..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-400 text-right"
            />
          </div>
        </div>

        {/* Left: Actions (Visually Left in RTL) */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all group">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
          </button>

          {/* User Profile */}
          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

          <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                   <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="User" />
                </div>
             </div>
             <div className="hidden md:block text-right mr-1">
                <p className="text-xs font-bold text-gray-700">المسؤول</p>
             </div>
          </button>
        </div>
      </div>
    </header>
  );
}
