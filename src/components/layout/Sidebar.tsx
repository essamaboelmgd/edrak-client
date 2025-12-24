import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  Wallet,
  Video,
  Layers,
  LogOut
} from 'lucide-react';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Menu Items Configuration
const menuItems = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', icon: Home, path: '/app', color: 'text-purple-500' },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Teachers', icon: Users, path: '/app/teachers', color: 'text-blue-500' },
      { name: 'Students', icon: Users, path: '/app/students', color: 'text-pink-500' },
    ]
  },
  {
    title: 'Content',
    items: [
      { name: 'Courses', icon: Layers, path: '/app/courses', color: 'text-orange-500' },
      { name: 'Lessons', icon: BookOpen, path: '/app/lessons', color: 'text-yellow-500' },
      { name: 'Exams', icon: FileText, path: '/app/exams', color: 'text-green-500' },
      { name: 'Library', icon: Video, path: '/app/library', color: 'text-red-500' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { name: 'Transactions', icon: Wallet, path: '/app/transactions', color: 'text-emerald-500' },
      { name: 'Reports', icon: BarChart2, path: '/app/reports', color: 'text-cyan-500' },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', icon: Settings, path: '/app/settings', color: 'text-gray-500' },
    ]
  }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={classNames(
        "relative h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/50 hidden md:flex flex-col z-50",
        "shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)]"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-gray-100 px-6">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-bold text-gray-800 text-lg leading-none">Edrak</span>
                <span className="text-xs text-gray-400 font-medium">Admin Panel</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-100 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-purple-600 hover:scale-110 transition-all z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-none">
        {menuItems.map((group, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => classNames(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-gray-50 text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Line */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full"
                        />
                      )}
                      
                      <item.icon 
                        size={20} 
                        className={classNames(
                          "shrink-0 transition-colors duration-300",
                          isActive ? item.color : "text-gray-400 group-hover:text-gray-600"
                        )} 
                      />
                      
                      {!isCollapsed && (
                        <span className="font-medium whitespace-nowrap">{item.name}</span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                          {item.name}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-gray-100">
        <button className={classNames(
          "flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors group",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
             <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="User" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-semibold text-gray-700 truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@edrak.cloud</p>
            </div>
          )}
          {!isCollapsed && <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />}
        </button>
      </div>
    </motion.aside>
  );
}
