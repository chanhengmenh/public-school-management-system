'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Sun,
  Trophy,
  User,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { apiFetch } from '@/lib/api'

export type Role = 'admin' | 'teacher' | 'home_teacher' | 'student' | 'class_monitor'

type NavItem = {
  id: string
  label: string
}

type UserInfo = {
  id?: string
  full_name?: string
  email?: string
  role?: string
}

type AppContextValue = {
  role: Role
  userId: string | null
  userName: string | null
  userEmail: string | null
  refreshUser: () => Promise<void>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export const useAppContext = () => {
  const value = useContext(AppContext)
  if (!value) {
    throw new Error('useAppContext must be used within AppShell')
  }
  return value
}

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  teacher: 'Subject Teacher',
  home_teacher: 'Home-Class Teacher',
  student: 'Student',
  class_monitor: 'Class Monitor',
}

const sharedNavigation: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'grades', label: 'Grades' },
    { id: 'messages', label: 'Messages' },
    { id: 'collaborations', label: 'Collaborations' },
    { id: 'files', label: 'Files' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'profile', label: 'Profile' },
    { id: 'classmates', label: 'Classmates' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'users', label: 'Users' },
    { id: 'classes', label: 'Classes' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'reports', label: 'Reports' },
    { id: 'system-analytics', label: 'System Analytics' },
]

const fallbackNavigationByRole: Record<Role, NavItem[]> = {
  student: sharedNavigation,
  teacher: sharedNavigation,
  home_teacher: sharedNavigation,
  class_monitor: sharedNavigation,
  admin: sharedNavigation,
}

const iconById: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  subjects: BookOpen,
  assignments: ClipboardList,
  grades: GraduationCap,
  submissions: Inbox,
  gradebook: GraduationCap,
  messages: MessageSquare,
  collaborations: Users,
  files: FileText,
  analytics: BarChart3,
  profile: User,
  'class-overview': Users,
  'class-analytics': BarChart3,
  'student-ranking': Trophy,
  classmates: Users,
  teachers: GraduationCap,
  attendance: Clock,
  users: Users,
  classes: Users,
  announcements: Bell,
  reports: FileText,
  'system-analytics': BarChart3,
}

const routeById: Record<string, string> = {
  dashboard: '/dashboard',
  subjects: '/subjects',
  assignments: '/assignments',
  grades: '/grades',
  messages: '/messages',
  collaborations: '/collaborations',
  files: '/files',
  analytics: '/analytics',
  profile: '/profile',
  classmates: '/classmates',
  teachers: '/teachers',
  attendance: '/attendance',
  users: '/users',
  classes: '/classes',
  announcements: '/announcements',
  reports: '/reports',
  'system-analytics': '/system-analytics',
  submissions: '/submissions',
  gradebook: '/gradebook',
  'class-overview': '/class-overview',
  'class-analytics': '/class-analytics',
  'student-ranking': '/student-ranking',
}

const isRole = (value: string | null): value is Role => {
  return (
    value === 'admin' ||
    value === 'teacher' ||
    value === 'home_teacher' ||
    value === 'student' ||
    value === 'class_monitor'
  )
}

async function fetchCurrentUser(): Promise<UserInfo | null> {
  try {
    return await apiFetch<UserInfo>('/api/auth/me')
  } catch {
    return null
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [role, setRole] = useState<Role>('student')
  const [navigationItems, setNavigationItems] = useState<NavItem[]>(fallbackNavigationByRole.student)
  const [isMounted, setIsMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const activeRoute = useMemo(() => {
    if (!pathname) {
      return '/dashboard'
    }
    return pathname
  }, [pathname])

  const refreshUser = async () => {
    const meData = await fetchCurrentUser()
    if (!meData) {
      setUserName(null)
      setUserEmail(null)
      return
    }

    setUserName(meData.full_name ?? null)
    setUserEmail(meData.email ?? null)
    setUserId(meData.id ?? null)

    const roleValue = meData.role ?? null
    if (isRole(roleValue)) {
      const nextRole: Role = roleValue
      setRole(nextRole)
      setNavigationItems(fallbackNavigationByRole[nextRole])
    }
  }

  useEffect(() => {
    setIsMounted(true)

    const loadRoleAndSidebar = async () => {
      await refreshUser()

      try {
        const data = await apiFetch<{ role?: string; items?: NavItem[] }>('/api/navigation/sidebar')
        const navRoleValue = data.role ?? null
        if (isRole(navRoleValue)) {
          setRole(navRoleValue)
        }
        if (data.items && data.items.length > 0) {
          setNavigationItems(data.items)
        }
      } catch {
        // Fallback to local navigation if backend is unavailable.
      }
    }

    loadRoleAndSidebar()
  }, [])

  const handleLogin = async () => {
    setIsAuthenticating(true)
    setLoginError(null)

    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      setIsLoginOpen(false)
      setLoginPassword('')
      await refreshUser()

      try {
        const navData = await apiFetch<{ role?: string; items?: NavItem[] }>('/api/navigation/sidebar')
        const refreshedRoleValue = navData.role ?? null
        if (isRole(refreshedRoleValue)) {
          setRole(refreshedRoleValue)
        }
        if (navData.items && navData.items.length > 0) {
          setNavigationItems(navData.items)
        }
      } catch {
        // Ignore sidebar refresh errors.
      }
    } catch {
      setLoginError('Unable to sign in. Check your credentials.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setRole('student')
      setNavigationItems(fallbackNavigationByRole.student)
      setUserName(null)
      setUserEmail(null)
      setUserId(null)
      setUserId(null)
    }
  }

  return (
    <AppContext.Provider value={{ role, userId, userName, userEmail, refreshUser }}>
      <div className="flex h-screen bg-background">
        <aside
          className={`transition-all duration-300 border-r border-border bg-card flex flex-col ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className={`border-b border-border p-4 flex items-center gap-3 ${sidebarCollapsed && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 font-bold text-secondary-foreground">
              C
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-sm">Canvas</div>
                <div className="text-xs text-muted-foreground">{roleLabels[role]}</div>
              </div>
            )}
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = iconById[item.id] ?? LayoutDashboard
              const href = routeById[item.id] ?? '/dashboard'
              const isActive = activeRoute === href
              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border p-3 space-y-2">
            <div className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                {isMounted && resolvedTheme === 'dark' ? (
                  <Moon className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Sun className="w-5 h-5 flex-shrink-0" />
                )}
                {!sidebarCollapsed && <span>Theme</span>}
              </div>
              {!sidebarCollapsed && (
                <Switch
                  checked={isMounted && resolvedTheme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  aria-label="Toggle dark mode"
                />
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarCollapsed && 'rotate-180'}`} />
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-border bg-card px-8 py-4 flex items-center justify-between h-16">
            <h1 className="text-lg font-semibold text-foreground">Canvas LMS</h1>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              {userName ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-foreground">{userName}</span>
                    {userEmail && <span className="text-xs text-muted-foreground">{userEmail}</span>}
                  </div>
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold">
                    {userName
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              ) : (
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Log in</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sign in</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="login-email">Email</label>
                        <Input
                          id="login-email"
                          type="email"
                          autoComplete="email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="login-password">Password</label>
                        <Input
                          id="login-password"
                          type="password"
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                      {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsLoginOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleLogin} disabled={isAuthenticating || !loginEmail || !loginPassword}>
                        {isAuthenticating ? 'Signing in...' : 'Sign in'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-6 md:p-8 max-w-6xl">
              <Card className="border-border shadow-none">
                <div className="p-6">{children}</div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AppContext.Provider>
  )
}
