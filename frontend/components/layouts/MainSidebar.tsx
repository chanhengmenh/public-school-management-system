'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    Bell,
    Settings,
    LogOut,
    GraduationCap,
    Menu,
    ClipboardCheck,
    Users,
    BarChart3,
    CalendarDays,
    ShieldCheck,
    LucideIcon
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { notificationsApi } from '@/lib/api/notifications';

interface MainSidebarProps {
    role?: string;
}

type NavLink = { name: string; href: string; icon: LucideIcon; badge?: number };

function getNavLinks(role: string | undefined, isClassMonitor: boolean, isHomeTeacher: boolean): { main: NavLink[]; account: NavLink[] } {
    if (role === 'teacher') {
        const main: NavLink[] = [
            { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
            { name: 'Classes', href: '/teacher/classes', icon: BookOpen },
            { name: 'Schedule', href: '/teacher/schedule', icon: Calendar },
        ];
        if (isHomeTeacher) {
            main.push({ name: 'Students', href: '/teacher/students', icon: Users });
        }
        return {
            main,
            account: [{ name: 'Settings', href: '/teacher/settings', icon: Settings }],
        };
    }

    if (role === 'admin') {
        return {
            main: [
                { name: 'Dashboard',  href: '/admin',           icon: LayoutDashboard },
                { name: 'Users',      href: '/admin/users',     icon: Users },
                { name: 'Academic',   href: '/admin/academic',  icon: BookOpen },
                { name: 'Timetable',  href: '/admin/timetable', icon: CalendarDays },
                { name: 'Analytics',  href: '/admin/analytics',  icon: BarChart3 },
                { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
            ],
            account: [{ name: 'Settings', href: '/admin/settings', icon: Settings }],
        };
    }

    // default: student
    const main: NavLink[] = [
        { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
        { name: 'Classes', href: '/student/classes', icon: BookOpen },
        { name: 'Schedule', href: '/student/schedule', icon: Calendar },
        { name: 'Notifications', href: '/student/notifications', icon: Bell },
    ];
    if (isClassMonitor) {
        main.push({ name: 'Attendance', href: '/student/attendance', icon: ClipboardCheck });
    }
    return {
        main,
        account: [{ name: 'Settings', href: '/student/settings', icon: Settings }],
    };
}

export default function MainSidebar({ role }: MainSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const effectiveRole = role ?? user?.role;

    useEffect(() => {
        if (effectiveRole !== 'student') return;
        const fetchCount = async () => {
            try {
                const data = await notificationsApi.unreadCount();
                setUnreadCount(data.count);
            } catch { /* non-critical */ }
        };
        fetchCount();
        const handler = () => fetchCount();
        window.addEventListener('notification:refresh', handler);
        return () => window.removeEventListener('notification:refresh', handler);
    }, [effectiveRole]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
        }
    };

    const { main: mainMenuLinks, account: accountLinks } = getNavLinks(
        effectiveRole,
        !!user?.is_class_monitor,
        !!user?.is_home_teacher,
    );

    const renderNavLinks = (links: NavLink[]) => {
        return links.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/teacher' && item.href !== '/student' && item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const liveCount = item.href === '/student/notifications' ? unreadCount : 0;

            return (
                <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-lg pr-4 py-2 my-1 transition-colors ${isCollapsed ? 'justify-center pl-0 border-l-0 mx-2' : 'pl-4 mx-2'
                        } ${isActive
                            ? 'bg-[#23252d] text-orange-500 border-l-4 border-orange-500'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white border-l-4 border-transparent'
                        }`}
                >
                    <div className="relative">
                        <div className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-800/60 text-slate-400 group-hover:text-white'
                            }`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        {isCollapsed && liveCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#0f172a]"></span>
                            </span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <>
                            <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isActive ? 'text-orange-500' : ''}`}>{item.name}</span>
                            {liveCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                    {liveCount}
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
                            <GraduationCap className="text-orange-500 h-6 w-6" />
                        </div>
                        <span className="text-white text-xl font-bold font-sans tracking-tight whitespace-nowrap overflow-hidden ml-3">
                            PSMS
                        </span>
                    </div>
                )}

                <div
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <Menu className="h-5 w-5" />
                </div>
            </div>

            {/* Navigation Areas */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

                {accountLinks.length > 0 && (
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
                )}
            </div>

            {/* Footer / User Profile */}
            <div className={`p-4 border-t border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                <div
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 cursor-pointer"
                    onClick={isCollapsed ? handleLogout : undefined}
                    title={isCollapsed ? 'Log Out' : undefined}
                >
                    <span className="text-white font-bold text-sm">{user?.full_name?.charAt(0) || 'U'}</span>
                </div>

                {!isCollapsed && (
                    <>
                        <div className="ml-3 flex flex-col min-w-0 overflow-hidden">
                            <span className="text-sm font-semibold text-white whitespace-nowrap truncate">{user?.full_name}</span>
                            <span className="text-xs text-slate-400 whitespace-nowrap truncate capitalize">{effectiveRole}</span>
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
