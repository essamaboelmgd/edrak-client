import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  BarChart,
  Globe
} from 'lucide-react';

// Mock Role (In real app, get from AuthContext)
// Types: 'admin' | 'teacher' | 'student'
type UserRole = 'admin' | 'teacher' | 'student';

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
}

const SIDEBAR_ITEMS: Record<UserRole, SidebarItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Overview', href: '/' },
    { icon: Users, label: 'Manage Users', href: '/users' },
    { icon: Globe, label: 'Platform Settings', href: '/settings' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: BookOpen, label: 'My Courses', href: '/courses' },
    { icon: Users, label: 'My Students', href: '/students' },
    { icon: BarChart, label: 'Analytics', href: '/analytics' },
    { icon: Globe, label: 'My Site', href: '/site-settings' },
  ],
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: BookOpen, label: 'My Learning', href: '/courses' },
    { icon: GraduationCap, label: 'Achievements', href: '/achievements' },
  ]
};

export default function DashboardLayout({ role = 'teacher' }: { role?: UserRole }) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const items = SIDEBAR_ITEMS[role];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {!isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(true)} />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
            "fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col",
            !isOpen && "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between h-16">
            {isOpen ? (
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Edrak</span>
            ) : (
                <span className="font-bold text-xl mx-auto">E</span>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="md:block hidden text-slate-400 hover:text-white">
                <Menu size={20} />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden block text-slate-400">
                <X size={20} />
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                            isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white",
                            !isOpen && "justify-center"
                        )}
                    >
                        <item.icon size={20} />
                        {isOpen && <span>{item.label}</span>}
                    </Link>
                )
            })}
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button className={cn(
                "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-400 hover:bg-slate-800 transition-colors",
                !isOpen && "justify-center"
            )}>
                <LogOut size={20} />
                {isOpen && <span>Logout</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30">
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 -ml-2">
                <Menu />
            </button>
            <div className="flex items-center gap-4 ml-auto">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">Ahmed Teacher</p>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    AT
                </div>
            </div>
        </header>
        <div className="p-6 md:p-8 overflow-auto h-[calc(100vh-64px)]">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
