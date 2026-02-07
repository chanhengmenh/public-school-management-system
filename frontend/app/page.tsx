'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  AlertCircle,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

type Role = 'admin' | 'teacher' | 'home_teacher' | 'student' | 'class_monitor'

type NavItem = {
  id: string
  label: string
}

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  teacher: 'Subject Teacher',
  home_teacher: 'Home-Class Teacher',
  student: 'Student',
  class_monitor: 'Class Monitor',
}

const fallbackNavigationByRole: Record<Role, NavItem[]> = {
  student: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'courses', label: 'Courses' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'grades', label: 'Grades' },
    { id: 'messages', label: 'Messages' },
    { id: 'collaborations', label: 'Collaborations' },
    { id: 'files', label: 'Files' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'profile', label: 'Profile' },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'courses', label: 'Courses' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'submissions', label: 'Submissions' },
    { id: 'gradebook', label: 'Gradebook' },
    { id: 'messages', label: 'Messages' },
    { id: 'collaborations', label: 'Collaborations' },
    { id: 'files', label: 'Files' },
    { id: 'analytics', label: 'Analytics' },
  ],
  home_teacher: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'class-overview', label: 'Class Overview' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'gradebook', label: 'Gradebook' },
    { id: 'class-analytics', label: 'Class Analytics' },
    { id: 'student-ranking', label: 'Student Ranking' },
    { id: 'messages', label: 'Messages' },
    { id: 'files', label: 'Files' },
  ],
  class_monitor: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'courses', label: 'Courses' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'messages', label: 'Messages' },
    { id: 'files', label: 'Files' },
    { id: 'profile', label: 'Profile' },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'classes', label: 'Classes' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'reports', label: 'Reports' },
    { id: 'system-analytics', label: 'System Analytics' },
  ],
}

const iconById: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  courses: BookOpen,
  assignments: ClipboardList,
  grades: GraduationCap,
  submissions: Inbox,
  gradebook: GraduationCap,
  messages: MessageSquare,
  collaborations: Users,
  files: FileText,
  analytics: BarChart3,
  profile: User,
  attendance: Clock,
  'class-overview': Users,
  'class-analytics': BarChart3,
  'student-ranking': Trophy,
  users: Users,
  classes: Users,
  subjects: BookOpen,
  announcements: Bell,
  reports: FileText,
  'system-analytics': BarChart3,
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

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
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

  useEffect(() => {
    setIsMounted(true)
    const loadRoleAndSidebar = async () => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'
      let activeRole: Role = 'student'

      try {
        const meResponse = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: 'include',
        })
        if (meResponse.ok) {
          const meData = (await meResponse.json()) as { role?: string; full_name?: string; email?: string }
          if (isRole(meData.role ?? null)) {
            activeRole = meData.role
          }
          setUserName(meData.full_name ?? null)
          setUserEmail(meData.email ?? null)
        } else {
          setUserName(null)
          setUserEmail(null)
        }
      } catch {
        // Fall back to student if auth is unavailable.
      }

      setRole(activeRole)
      setNavigationItems(fallbackNavigationByRole[activeRole])

      try {
        const response = await fetch(`${apiBaseUrl}/api/navigation/sidebar`, {
          credentials: 'include',
        })
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { role?: string; items?: NavItem[] }
        if (isRole(data.role ?? null)) {
          setRole(data.role)
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
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      if (!response.ok) {
        setLoginError('Invalid email or password.')
        return
      }

      setIsLoginOpen(false)
      setLoginPassword('')

      const meResponse = await fetch(`${apiBaseUrl}/api/auth/me`, {
        credentials: 'include',
      })
      if (meResponse.ok) {
        const meData = (await meResponse.json()) as { role?: string; full_name?: string; email?: string }
        if (isRole(meData.role ?? null)) {
          setRole(meData.role)
          setNavigationItems(fallbackNavigationByRole[meData.role])
        }
        setUserName(meData.full_name ?? null)
        setUserEmail(meData.email ?? null)
      }

      const navResponse = await fetch(`${apiBaseUrl}/api/navigation/sidebar`, {
        credentials: 'include',
      })
      if (navResponse.ok) {
        const navData = (await navResponse.json()) as { role?: string; items?: NavItem[] }
        if (isRole(navData.role ?? null)) {
          setRole(navData.role)
        }
        if (navData.items && navData.items.length > 0) {
          setNavigationItems(navData.items)
        }
      }
    } catch {
      setLoginError('Unable to reach the server.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setRole('student')
      setNavigationItems(fallbackNavigationByRole.student)
      setUserName(null)
      setUserEmail(null)
    }
  }

  const activeTabLabel = navigationItems.find((item) => item.id === activeTab)?.label ?? activeTab

  const courses: {
    id: number
    name: string
    code: string
    instructor: string
    progress: number
    unreadMessages: number
  }[] = []

  const assignments: {
    id: number
    title: string
    course: string
    dueDate: string
    status: string
  }[] = []

  const announcements: {
    id: number
    course: string
    title: string
    date: string
    isNew: boolean
  }[] = []

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <aside
        className={`transition-all duration-300 border-r border-border bg-card flex flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
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

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = iconById[item.id] ?? LayoutDashboard
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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

        {/* Content with responsive sidebar */}
        <div className="flex flex-1 overflow-hidden flex-col xl:flex-row">
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto w-full">
            <div className="p-6 md:p-8 max-w-5xl">
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-semibold text-foreground mb-1">Your Courses</h2>
                    <p className="text-sm text-muted-foreground">
                      {courses.length} courses • {assignments.filter((a) => a.status === 'pending').length} pending assignments
                    </p>
                  </div>

                  {/* Vertical Course List */}
                  <div className="space-y-4">
                    {courses.length === 0 ? (
                      <Card className="border-border">
                        <CardContent className="py-6 text-sm text-muted-foreground">
                          Course data will appear here once it is loaded from the database.
                        </CardContent>
                      </Card>
                    ) : (
                      courses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => console.log(`Navigate to course ${course.id}`)}
                          className="w-full text-left p-6 rounded-lg border border-border bg-card hover:border-secondary hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                                  {course.code}
                                </Badge>
                                {course.unreadMessages > 0 && (
                                  <Badge className="bg-secondary text-secondary-foreground">
                                    {course.unreadMessages}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                                {course.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Progress
                              </span>
                              <span className="text-xs font-semibold text-foreground">{course.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent transition-all group-hover:bg-secondary"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground">Assignments</h2>
                  <div className="space-y-3">
                    {assignments.length === 0 ? (
                      <Card className="border-border">
                        <CardContent className="py-6 text-sm text-muted-foreground">
                          Assignment data will appear here once it is loaded from the database.
                        </CardContent>
                      </Card>
                    ) : (
                      assignments.map((assignment) => (
                        <Card key={assignment.id} className="border-border">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-secondary uppercase mb-1">{assignment.course}</p>
                                <h3 className="font-semibold text-foreground mb-2">{assignment.title}</h3>
                                <p className="text-sm text-muted-foreground">Due {assignment.dueDate}</p>
                              </div>
                              <Badge className={assignment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                                {assignment.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'grades' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground">Grades</h2>
                  <Card className="border-border">
                    <CardContent className="py-6 text-sm text-muted-foreground">
                      Grade data will appear here once it is loaded from the database.
                    </CardContent>
                  </Card>
                </div>
              )}

              {[
                'courses',
                'messages',
                'collaborations',
                'files',
                'analytics',
                'profile',
                'submissions',
                'gradebook',
                'class-overview',
                'class-analytics',
                'student-ranking',
                'attendance',
                'users',
                'classes',
                'subjects',
                'announcements',
                'reports',
                'system-analytics',
              ].includes(activeTab) && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground">{activeTabLabel}</h2>
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>{activeTabLabel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{activeTabLabel} feature content will appear here</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar - Announcements & Due Soon */}
          {activeTab === 'dashboard' && (
            <div className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-border bg-card xl:overflow-auto">
              {/* Header with toggle */}
              <div className="flex items-center h-12 border-b border-border px-4 shrink-0">
                <h3 className="font-semibold text-sm text-foreground">Quick Access</h3>
              </div>

              <div className="p-4 space-y-6 overflow-y-auto">
                {/* Announcements */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Announcements</h4>
                  <div className="space-y-2">
                    {announcements.length === 0 ? (
                      <Card className="border-border">
                        <CardContent className="py-4 text-sm text-muted-foreground">
                          Announcements will appear here once they are loaded from the database.
                        </CardContent>
                      </Card>
                    ) : (
                      announcements.map((announcement) => (
                        <div key={announcement.id} className="p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-secondary">{announcement.course}</span>
                            {announcement.isNew && (
                              <Badge className="bg-secondary text-secondary-foreground text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground font-medium">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{announcement.date}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Due Soon */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Due Soon</h4>
                  <div className="space-y-2">
                    {assignments.length === 0 ? (
                      <Card className="border-border">
                        <CardContent className="py-4 text-sm text-muted-foreground">
                          Upcoming due items will appear here once they are loaded from the database.
                        </CardContent>
                      </Card>
                    ) : (
                      assignments.slice(0, 2).map((assignment) => (
                        <div key={assignment.id} className="p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-secondary mb-1">{assignment.course}</p>
                              <p className="text-sm text-foreground font-medium truncate">{assignment.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{assignment.dueDate}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
