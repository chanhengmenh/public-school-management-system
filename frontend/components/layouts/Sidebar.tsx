'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  Shield,
  Menu,
  LogOut,
  X,
} from 'lucide-react';
import {
  NAV_CONFIG,
  ROLE_THEMES,
  HOME_CLASS_LINKS,
  type DashboardRole,
  type NavLink,
  type NavGroup,
} from '@/lib/navigation-config';
import { useStudentNotifications } from '@/contexts/StudentNotificationContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuthStore } from '@/store/useAuthStore';
import { getStudentData } from '@/lib/mock-data/student';
import { getTeacherData } from '@/lib/mock-data/teacher';

interface SidebarProps {
  role: DashboardRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user } = useAuthStore();
  const baseTheme = ROLE_THEMES[role];
  const staticNavGroups = NAV_CONFIG[role];
  
  const studentData = role === 'student' ? getStudentData(user?.id ?? 'alex_id') : null;
  const teacherData = role === 'teacher' ? getTeacherData(user?.id ?? 'teacher_001') : null;

  const theme = useMemo(() => {
    if (role === 'student' && studentData) {
      return {
        ...baseTheme,
        userName: studentData.name,
        userDetail: studentData.gradeLevel,
        userInitials: studentData.initials,
      };
    } else if (role === 'teacher' && teacherData) {
      return {
        ...baseTheme,
        userName: teacherData.name,
        userDetail: teacherData.homeClass ? 'Home-Class Teacher' : 'Subject Teacher',
        userInitials: teacherData.initials,
      };
    }
    return baseTheme;
  }, [role, studentData, teacherData, baseTheme]);

  // ─── Dynamic badge counts from context ───
  let dynamicUnread: number | undefined;
  try {
    if (role === 'student') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const ctx = useStudentNotifications();
      dynamicUnread = ctx.unreadCount;
    } else if (role === 'teacher') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const ctx = useNotifications();
      dynamicUnread = ctx.unreadCount;
    }
  } catch {
    // Context not available yet (e.g. during SSR)
  }

  // Override notification link badge with live unread count
  const navGroups: NavGroup[] = useMemo(() => {
    let baseGroups = staticNavGroups;

    if (role === 'teacher' && teacherData?.homeClass) {
      baseGroups = [
        baseGroups[0],
        {
          label: `MY HOME CLASS (${teacherData.homeClass.name})`,
          links: HOME_CLASS_LINKS,
        },
        baseGroups[1],
      ];
    }

    const notifHref = role === 'student' ? '/student/notifications' : role === 'teacher' ? '/teacher/notifications' : null;
    if (notifHref == null || dynamicUnread == null) return baseGroups;

    return baseGroups.map(group => ({
      ...group,
      links: group.links.map(link =>
        link.href === notifHref
          ? { ...link, badge: dynamicUnread > 0 ? dynamicUnread : undefined }
          : link
      ),
    }));
  }, [staticNavGroups, role, teacherData?.homeClass, dynamicUnread]);

  // ─── Close mobile drawer on route change ───
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      document.cookie = 'mock_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'mock_sub_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    }
  };

  // ─── Active link logic (fuzzy matching) ───
  const isActive = (href: string) => {
    // Dashboard root: exact match only
    if (href === '/student' || href === '/teacher' || href === '/admin') {
      return pathname === href;
    }
    // Sub-pages: prefix match
    return pathname === href || pathname.startsWith(href + '/');
  };

  // ─── Logo icon per role ───
  const LogoIcon = role === 'admin' ? Shield : GraduationCap;

  // ─── Render a single nav link ───
  const renderNavLink = (item: NavLink) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        title={isCollapsed ? item.name : undefined}
        className={`flex items-center rounded-lg pr-4 py-2 my-0.5 transition-colors ${
          isCollapsed
            ? 'justify-center pl-0 border-l-0 mx-2'
            : 'pl-4 mx-2'
        } ${
          active
            ? `bg-[#23252d] ${theme.activeText} border-l-4 ${theme.activeBorder}`
            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white border-l-4 border-transparent'
        }`}
      >
        <div className="relative">
          <div
            className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
              active
                ? `${theme.activeBg} ${theme.activeText}`
                : 'bg-slate-800/60 text-slate-400 group-hover:text-white'
            }`}
          >
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
            <span
              className={`ml-3 text-sm font-medium whitespace-nowrap ${
                active ? theme.activeText : ''
              }`}
            >
              {item.name}
            </span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  // ─── Sidebar content (shared between desktop & mobile) ───
  const sidebarContent = (
    <>
      {/* Header / Logo Area */}
      <div
        className={`h-16 flex items-center border-b border-slate-800 mt-2 ${
          isCollapsed ? 'justify-center' : 'justify-between px-6'
        }`}
      >
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="bg-slate-800/50 p-2 rounded-xl flex items-center justify-center shrink-0">
              <LogoIcon className={`${theme.logoColor} h-6 w-6`} />
            </div>
            <div className="ml-3 flex flex-col min-w-0 overflow-hidden">
              <span className="text-white text-xl font-bold font-serif tracking-tight whitespace-nowrap overflow-hidden">
                EduSchool
              </span>
              {role !== 'student' && (
                <span className={`text-[10px] ${theme.logoColor.replace('text-', 'text-').replace('500', '400')} tracking-wider font-sans uppercase`}>
                  {theme.portalLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Desktop: Toggle collapse. Hidden on mobile (mobile uses its own close button). */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer items-center justify-center shrink-0 ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-5 w-5" />
        </div>

        {/* Mobile: Close button */}
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </div>
      </div>

      {/* Navigation Areas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navGroups.map((group) => {
          // Skip groups that require a sub-role if it doesn't match
          if (group.subRoleRequired && group.subRoleRequired !== user?.subRole) {
            return null;
          }

          return (
            <div key={group.label} className="mb-6">
              {!isCollapsed && (
                <h3 className="text-xs font-bold text-slate-500 tracking-widest px-6 mb-3 mt-2 uppercase whitespace-nowrap">
                  {group.label}
                </h3>
              )}
              <nav className="space-y-1">
                {group.links.map(renderNavLink)}
              </nav>
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div
        className={`p-4 border-t border-slate-800 flex items-center ${
          isCollapsed ? 'justify-center' : ''
        }`}
      >
        {/* Avatar */}
        <div
          className={`h-10 w-10 rounded-full bg-gradient-to-br ${theme.avatarGradient} flex items-center justify-center shrink-0 cursor-pointer`}
          onClick={isCollapsed ? handleLogout : undefined}
          title={isCollapsed ? 'Log Out' : undefined}
        >
          <span className="text-white font-bold text-sm">
            {theme.userInitials}
          </span>
        </div>

        {/* User Info & Logout Button (Expanded Only) */}
        {!isCollapsed && (
          <>
            <div className="ml-3 flex flex-col min-w-0 overflow-hidden">
              <span className="text-sm font-semibold text-white whitespace-nowrap truncate">
                {theme.userName}
              </span>
              <span className="text-xs text-slate-400 whitespace-nowrap truncate">
                {theme.userDetail}
              </span>
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
    </>
  );

  return (
    <>
      {/* ─── Mobile Hamburger FAB ─── */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0f172a] rounded-xl border border-slate-700 text-slate-300 shadow-lg hover:bg-slate-800 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ─── Mobile Overlay ─── */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer ─── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={`hidden md:flex relative h-screen bg-[#0f172a] border-r border-slate-800 flex-col z-50 overflow-x-hidden transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isCollapsed ? 'w-24' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
