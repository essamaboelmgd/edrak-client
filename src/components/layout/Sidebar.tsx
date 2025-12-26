import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Layers,
  LogOut,
  GraduationCap,
  Shield,
  Database
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Menu Items Configuration based on role
const getMenuItems = (role: UserRole | null) => {
  const basePath = role === UserRole.ADMIN ? '/admin' : role === UserRole.TEACHER ? '/teacher' : role === UserRole.STUDENT ? '/student' : '/app';

  if (role === UserRole.ADMIN) {
    return [
      {
        title: 'نظرة عامة',
        items: [
          { name: 'الرئيسية', icon: Home, path: `${basePath}`, color: 'text-red-500' },
        ]
      },
      {
        title: 'الإدارة',
        items: [
          { name: 'المدرسين', icon: Users, path: `${basePath}/teachers`, color: 'text-blue-500' },
          { name: 'الطلاب', icon: Users, path: `${basePath}/students`, color: 'text-pink-500' },
        ]
      },
      {
        title: 'المحتوى',
        items: [
          { name: 'الكورسات', icon: Layers, path: `${basePath}/courses`, color: 'text-orange-500' },
        ]
      },
      {
        title: 'النظام',
        items: [
          { name: 'الإعدادات', icon: Settings, path: `${basePath}/settings`, color: 'text-gray-500' },
        ]
      }
    ];
  }

  if (role === UserRole.TEACHER) {
    return [
      {
        title: 'نظرة عامة',
        items: [
          { name: 'الرئيسية', icon: Home, path: `${basePath}`, color: 'text-purple-500' },
        ]
      },
      {
        title: 'المحتوى',
        items: [
          { name: 'الكورسات', icon: Layers, path: `${basePath}/courses`, color: 'text-orange-500' },
          { name: 'الحصص', icon: BookOpen, path: `${basePath}/lessons`, color: 'text-yellow-500' },
          { name: 'الاختبارات', icon: FileText, path: `${basePath}/exams`, color: 'text-green-500' },
          { name: 'بنك الأسئلة', icon: Database, path: `${basePath}/question-bank`, color: 'text-indigo-500' },
        ]
      },
      {
        title: 'الطلاب',
        items: [
          { name: 'طلابي', icon: Users, path: `${basePath}/students`, color: 'text-blue-500' },
        ]
      },
      {
        title: 'المالية',
        items: [
          { name: 'المعاملات', icon: Wallet, path: `${basePath}/transactions`, color: 'text-emerald-500' },
          { name: 'التقارير', icon: BarChart2, path: `${basePath}/reports`, color: 'text-cyan-500' },
        ]
      },
      {
        title: 'النظام',
        items: [
          { name: 'الإعدادات', icon: Settings, path: `${basePath}/settings`, color: 'text-gray-500' },
        ]
      }
    ];
  }

  if (role === UserRole.STUDENT) {
    return [
      {
        title: 'نظرة عامة',
        items: [
          { name: 'الرئيسية', icon: Home, path: `${basePath}`, color: 'text-blue-500' },
        ]
      },
      {
        title: 'التعلم',
        items: [
          { name: 'الكورسات', icon: Layers, path: `${basePath}/courses`, color: 'text-orange-500' },
          { name: 'الحصص', icon: BookOpen, path: `${basePath}/lessons`, color: 'text-yellow-500' },
          { name: 'الاختبارات', icon: FileText, path: `${basePath}/exams`, color: 'text-green-500' },
        ]
      },
      {
        title: 'النظام',
        items: [
          { name: 'الإعدادات', icon: Settings, path: `${basePath}/settings`, color: 'text-gray-500' },
        ]
      }
    ];
  }

  // Default menu (fallback)
  return [
    {
      title: 'نظرة عامة',
      items: [
        { name: 'الرئيسية', icon: Home, path: '/app', color: 'text-purple-500' },
      ]
    }
  ];
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, role, logout } = useAuth();
  const menuItems = getMenuItems(role);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  }, [location.pathname, onClose]);

  const getRoleDisplay = () => {
    if (role === UserRole.ADMIN) return { name: 'المسؤول', icon: Shield, color: 'from-red-600 to-orange-600' };
    if (role === UserRole.TEACHER) return { name: 'مدرس', icon: GraduationCap, color: 'from-purple-600 to-blue-600' };
    if (role === UserRole.STUDENT) return { name: 'طالب', icon: Users, color: 'from-blue-600 to-purple-600' };
    return { name: 'مستخدم', icon: Users, color: 'from-gray-600 to-gray-600' };
  };

  const roleDisplay = getRoleDisplay();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 280
        }}
        // Reset transform on desktop to ensure it's always visible
        style={{
           transform: undefined 
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={classNames(
          "fixed md:relative inset-y-0 right-0 z-[100] md:z-auto bg-white/80 backdrop-blur-xl border-l border-gray-200/50 flex flex-col transition-transform duration-300 ease-in-out",
          "shadow-[-4px_0_24px_-4px_rgba(0,0,0,0.05)]",
          // Mobile specific classes to handle slide-in from right (RTL)
          "md:translate-x-0",
          !isOpen ? "translate-x-full md:translate-x-0" : "translate-x-0", 
          "h-screen"
        )}
      >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-gray-100 px-6">
        <div className="flex items-center gap-3 w-full overflow-hidden justify-end">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col items-end"
              >
                <span className="font-bold text-gray-800 text-lg leading-none">إدراك</span>
                <span className="text-xs text-gray-400 font-medium">لوحة التحكم</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleDisplay.color} flex items-center justify-center shrink-0 shadow-lg`}>
            <span className="text-white font-bold text-xl">E</span>
          </div>
        </div>
      </div>

      {/* Collapse Toggle - Left Side for RTL */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-24 w-6 h-6 bg-white border border-gray-100 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-purple-600 hover:scale-110 transition-all z-50"
      >
        {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-none">
        {menuItems.map((group, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 text-right">
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
                      {/* Active Indicator Line - Right Side for RTL */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-l-full"
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

                      {/* Tooltip for collapsed state - Left side for RTL */}
                      {isCollapsed && (
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
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
        <button
          onClick={logout}
          className={classNames(
            "flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors group",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
            <img src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=random`} alt="User" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-right overflow-hidden">
              <p className="text-sm font-semibold text-gray-700 truncate">{user?.firstName || 'مستخدم'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          )}
          {!isCollapsed && <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors rotate-180" />}
        </button>
      </div>
    </motion.aside>
    </>
  );
}
