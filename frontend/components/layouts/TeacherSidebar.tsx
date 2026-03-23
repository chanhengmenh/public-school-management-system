'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    Bell,
    Settings,
    LogOut,
    GraduationCap,
    Menu,
    Trophy,
    CalendarCheck,
    BarChart,
    Users
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function TeacherSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { unreadCount } = useNotifications();
    const [isHomeTeacher, setIsHomeTeacher] = useState(false);

    useEffect(() => {
        if (document.cookie.includes('mock_sub_role=home_teacher')) {
            setIsHomeTeacher(true);
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            document.cookie = "mock_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push('/login');
        }
    };

    type NavLink = { name: string; href: string; icon: React.ElementType; badge?: number };

    const mainMenuLinks: NavLink[] = [
        { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
        { name: 'Classes', href: '/teacher/classes', icon: BookOpen },
        { name: 'Schedule', href: '/teacher/schedule', icon: Calendar },
        { name: 'Notifications', href: '/teacher/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    ];

    const accountLinks: NavLink[] = [
        { name: 'Settings', href: '/teacher/settings', icon: Settings },
    ];

    const homeClassLinks: NavLink[] = [
        { name: 'Ranking', href: '/teacher/home-class/ranking', icon: Trophy },
        { name: 'Attendance', href: '/teacher/home-class/attendance', icon: CalendarCheck },
        { name: 'Analytics', href: '/teacher/home-class/analytics', icon: BarChart },
        { name: 'People', href: '/teacher/home-class/people', icon: Users },
    ];

    const renderNavLinks = (links: NavLink[]) => {
        return links.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
                <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-lg pr-4 py-2 my-1 transition-colors ${isCollapsed ? 'justify-center pl-0 border-l-0 mx-2' : 'pl-4 mx-2'
                        } ${isActive
                            ? 'bg-[#23252d] text-blue-500 border-l-4 border-blue-500'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white border-l-4 border-transparent'
                        }`}
                >
                    <div className="relative">
                        <div className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800/60 text-slate-400 group-hover:text-white'
                            }`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        {isCollapsed && item.badge && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#0f172a]"></span>
                            </span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <>
                            <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isActive ? 'text-blue-500' : ''}`}>{item.name}</span>
                            {item.badge && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                    {item.badge}
                                </span>
                            )}
                        </>
                    )}
                </Link>
            );
        });
    };

    return (
        <aside
            className={`relative h-screen bg-[#0f172a] border-r border-slate-800 flex flex-col z-50 overflow-x-hidden transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'w-24' : 'w-64'
                }`}
        >
            {/* Header / Logo Area */}
            <div className={`h-16 flex items-center border-b border-slate-800 mt-2 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                {!isCollapsed && (
                    <div className="flex items-center">
                        <div className="bg-slate-800/50 p-2 rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap className="text-blue-500 h-6 w-6" />
                        </div>
                        <div className="ml-3 flex flex-col min-w-0 overflow-hidden">
                            <span className="text-white text-xl font-bold font-serif tracking-tight whitespace-nowrap overflow-hidden">
                                EduSchool
                            </span>
                            <span className="text-[10px] text-blue-400 tracking-wider font-sans uppercase">
                                TEACHER PORTAL
                            </span>
                        </div>
                    </div>
                )}

                {/* Toggle Button */}
                <div
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <Menu className="h-5 w-5" />
                </div>
            </div>

            {/* Navigation Areas */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* Main Menu Group */}
                <div className="mb-6">
                    {!isCollapsed && (
                        <h3 className="text-xs font-bold text-slate-500 tracking-widest px-6 mb-3 mt-2 uppercase whitespace-nowrap">
                            Main Menu
                        </h3>
                    )}
                    <nav className="space-y-1">
                        {renderNavLinks(mainMenuLinks)}
                    </nav>
                </div>

                {/* Home Class Group */}
                {isHomeTeacher && (
                    <div className="mb-6">
                        {!isCollapsed && (
                            <h3 className="text-xs font-bold text-slate-500 tracking-widest px-6 mb-3 mt-2 uppercase whitespace-nowrap">
                                My Home Class (10-A)
                            </h3>
                        )}
                        <nav className="space-y-1">
                            {renderNavLinks(homeClassLinks)}
                        </nav>
                    </div>
                )}

                {/* Account Group */}
                <div>
                    {!isCollapsed && (
                        <h3 className="text-xs font-bold text-slate-500 tracking-widest px-6 mb-3 mt-6 uppercase whitespace-nowrap">
                            Account
                        </h3>
                    )}
                    <nav className="space-y-1">
                        {renderNavLinks(accountLinks)}
                    </nav>
                </div>
            </div>

            {/* Footer / User Profile */}
            <div className={`p-4 border-t border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                {/* Avatar */}
                <div
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 cursor-pointer"
                    onClick={isCollapsed ? handleLogout : undefined}
                    title={isCollapsed ? "Log Out" : undefined}
                >
                    <span className="text-white font-bold text-sm">TW</span>
                </div>

                {/* User Info & Logout Button (Expanded Only) */}
                {!isCollapsed && (
                    <>
                        <div className="ml-3 flex flex-col min-w-0 overflow-hidden">
                            <span className="text-sm font-semibold text-white whitespace-nowrap truncate">Mr. Tan Wei</span>
                            <span className="text-xs text-slate-400 whitespace-nowrap truncate">Subject Teacher · Physics</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="ml-auto text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}
