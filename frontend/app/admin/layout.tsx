'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart3,
    Users,
    GraduationCap,
    CalendarRange,
    Megaphone,
    Settings,
    LogOut,
    Menu,
    Shield,
} from 'lucide-react';

// --- Nav Data ---
type NavLink = { name: string; href: string; icon: React.ElementType; badge?: number };

const overviewLinks: NavLink[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
];

const managementLinks: NavLink[] = [
    { name: 'Users', href: '/admin/users', icon: Users, badge: 3 },
    { name: 'Classes', href: '/admin/classes', icon: GraduationCap },
    { name: 'Timetable', href: '/admin/timetable', icon: CalendarRange },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone, badge: 2 },
];

const systemLinks: NavLink[] = [
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            document.cookie = "mock_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push('/login');
        }
    };

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    const renderNavLinks = (links: NavLink[]) => {
        return links.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
                <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-lg pr-4 py-2 my-0.5 transition-colors ${isCollapsed ? 'justify-center pl-0 border-l-0 mx-2' : 'pl-4 mx-2'
                        } ${active
                            ? 'bg-[#23252d] text-blue-500 border-l-4 border-blue-500'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white border-l-4 border-transparent'
                        }`}
                >
                    <div className="relative">
                        <div className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800/60 text-slate-400 group-hover:text-white'
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
                            <span className={`ml-3 text-sm font-medium whitespace-nowrap ${active ? 'text-blue-500' : ''}`}>{item.name}</span>
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

    const renderSectionHeader = (title: string) => {
        if (isCollapsed) return null;
        return (
            <h3 className="text-xs font-bold text-slate-500 tracking-widest px-6 mb-3 mt-2 uppercase whitespace-nowrap">
                {title}
            </h3>
        );
    };

    return (
        <div className="flex bg-slate-50 min-h-screen overflow-hidden text-slate-900">
            {/* Sidebar */}
            <aside
                className={`relative h-screen bg-[#0f172a] border-r border-slate-800 flex flex-col z-50 overflow-x-hidden transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'w-24' : 'w-64'
                    }`}
            >
                {/* Header / Logo Area */}
                <div className={`h-16 flex items-center border-b border-slate-800 mt-2 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                    {!isCollapsed && (
                        <div className="flex items-center">
                            <div className="bg-slate-800/50 p-2 rounded-xl flex items-center justify-center shrink-0">
                                <Shield className="text-blue-500 h-6 w-6" />
                            </div>
                            <div className="ml-3 flex flex-col min-w-0 overflow-hidden">
                                <span className="text-white text-xl font-bold font-serif tracking-tight whitespace-nowrap overflow-hidden">
                                    EduSchool
                                </span>
                                <span className="text-[10px] text-blue-400 tracking-wider font-sans uppercase">
                                    ADMIN PORTAL
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

                    {/* Overview */}
                    <div className="mb-6">
                        {renderSectionHeader('Overview')}
                        <nav className="space-y-1">
                            {renderNavLinks(overviewLinks)}
                        </nav>
                    </div>

                    {/* Management */}
                    <div className="mb-6">
                        {renderSectionHeader('Management')}
                        <nav className="space-y-1">
                            {renderNavLinks(managementLinks)}
                        </nav>
                    </div>

                    {/* System */}
                    <div>
                        {renderSectionHeader('System')}
                        <nav className="space-y-1">
                            {renderNavLinks(systemLinks)}
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
                        <span className="text-white font-bold text-sm">SA</span>
                    </div>

                    {/* User Info & Logout Button (Expanded Only) */}
                    {!isCollapsed && (
                        <>
                            <div className="ml-3 flex flex-col min-w-0 overflow-hidden">
                                <span className="text-sm font-semibold text-white whitespace-nowrap truncate">Super Admin</span>
                                <span className="text-xs text-slate-400 whitespace-nowrap truncate">System Administrator</span>
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

            {/* Content Area */}
            <main className="flex-1 bg-slate-50 overflow-y-auto h-screen relative">
                {children}
            </main>
        </div>
    );
}