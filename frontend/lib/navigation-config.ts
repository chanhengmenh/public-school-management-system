import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Bell,
  Settings,
  ClipboardCheck,
  Trophy,
  CalendarCheck,
  BarChart,
  Users,
  GraduationCap,
  CalendarRange,
  Megaphone,
  User,
  Shield,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────

export interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
  /** If set, this group only appears when this sub-role condition is met */
  subRoleRequired?: string;
}

export type DashboardRole = 'student' | 'teacher' | 'admin';

// ─── Student Navigation ──────────────────────────────────────────────

const STUDENT_MAIN: NavLink[] = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Classes', href: '/student/classes', icon: BookOpen },
  { name: 'Schedule', href: '/student/schedule', icon: Calendar },
  { name: 'Notifications', href: '/student/notifications', icon: Bell },
];

const STUDENT_MONITOR: NavLink[] = [
  { name: 'Draft Attendance', href: '/student/attendance', icon: ClipboardCheck },
];

const STUDENT_ACCOUNT: NavLink[] = [
  { name: 'Settings', href: '/student/settings', icon: Settings },
];

export const STUDENT_NAV: NavGroup[] = [
  { label: 'Main Menu', links: STUDENT_MAIN },
  { label: 'Monitor Tasks', links: STUDENT_MONITOR, subRoleRequired: 'monitor' },
  { label: 'Account', links: STUDENT_ACCOUNT },
];

export type SettingsTab = 'profile' | 'security' | 'notifications';

export const STUDENT_SETTINGS_TABS: { key: SettingsTab; label: string; icon: LucideIcon }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

// ─── Teacher Navigation ──────────────────────────────────────────────

const TEACHER_MAIN: NavLink[] = [
  { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { name: 'Classes', href: '/teacher/classes', icon: BookOpen },
  { name: 'Schedule', href: '/teacher/schedule', icon: Calendar },
  { name: 'Notifications', href: '/teacher/notifications', icon: Bell },
];

const TEACHER_HOME_CLASS: NavLink[] = [
  { name: 'Ranking', href: '/teacher/home-class/ranking', icon: Trophy },
  { name: 'Attendance', href: '/teacher/home-class/attendance', icon: CalendarCheck },
  { name: 'Analytics', href: '/teacher/home-class/analytics', icon: BarChart },
  { name: 'People', href: '/teacher/home-class/people', icon: Users },
];

const TEACHER_ACCOUNT: NavLink[] = [
  { name: 'Settings', href: '/teacher/settings', icon: Settings },
];

export const TEACHER_NAV: NavGroup[] = [
  { label: 'Main Menu', links: TEACHER_MAIN },
  { label: 'My Home Class (10-A)', links: TEACHER_HOME_CLASS, subRoleRequired: 'home_teacher' },
  { label: 'Account', links: TEACHER_ACCOUNT },
];

// ─── Admin Navigation ────────────────────────────────────────────────

const ADMIN_OVERVIEW: NavLink[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
];

const ADMIN_MANAGEMENT: NavLink[] = [
  { name: 'Users', href: '/admin/users', icon: Users, badge: 3 },
  { name: 'Classes', href: '/admin/classes', icon: GraduationCap },
  { name: 'Timetable', href: '/admin/timetable', icon: CalendarRange },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone, badge: 2 },
];

const ADMIN_SYSTEM: NavLink[] = [
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const ADMIN_NAV: NavGroup[] = [
  { label: 'Overview', links: ADMIN_OVERVIEW },
  { label: 'Management', links: ADMIN_MANAGEMENT },
  { label: 'System', links: ADMIN_SYSTEM },
];

// ─── Lookup ──────────────────────────────────────────────────────────

export const NAV_CONFIG: Record<DashboardRole, NavGroup[]> = {
  student: STUDENT_NAV,
  teacher: TEACHER_NAV,
  admin: ADMIN_NAV,
};

// ─── Role Theming ────────────────────────────────────────────────────

export interface RoleTheme {
  accent: string;          // e.g. 'orange-500'
  activeText: string;      // e.g. 'text-orange-500'
  activeBg: string;        // e.g. 'bg-orange-500/10'
  activeBorder: string;    // e.g. 'border-orange-500'
  logoColor: string;       // e.g. 'text-orange-500'
  portalLabel: string;     // e.g. 'STUDENT PORTAL'
  avatarGradient: string;  // e.g. 'from-orange-500 to-red-500'
  userName: string;        // Mock user name
  userDetail: string;      // Mock user detail
  userInitials: string;    // Avatar initials
}

export const ROLE_THEMES: Record<DashboardRole, RoleTheme> = {
  student: {
    accent: 'orange-500',
    activeText: 'text-orange-500',
    activeBg: 'bg-orange-500/10',
    activeBorder: 'border-orange-500',
    logoColor: 'text-orange-500',
    portalLabel: 'STUDENT PORTAL',
    avatarGradient: 'from-indigo-500 to-purple-500',
    userName: 'Alex',
    userDetail: 'Grade 11 · Science',
    userInitials: 'A',
  },
  teacher: {
    accent: 'blue-500',
    activeText: 'text-blue-500',
    activeBg: 'bg-blue-500/10',
    activeBorder: 'border-blue-500',
    logoColor: 'text-blue-500',
    portalLabel: 'TEACHER PORTAL',
    avatarGradient: 'from-blue-500 to-indigo-500',
    userName: 'Mr. Tan Wei',
    userDetail: 'Subject Teacher · Physics',
    userInitials: 'TW',
  },
  admin: {
    accent: 'blue-500',
    activeText: 'text-blue-500',
    activeBg: 'bg-blue-500/10',
    activeBorder: 'border-blue-500',
    logoColor: 'text-blue-500',
    portalLabel: 'ADMIN PORTAL',
    avatarGradient: 'from-blue-500 to-indigo-500',
    userName: 'Super Admin',
    userDetail: 'System Administrator',
    userInitials: 'SA',
  },
};
