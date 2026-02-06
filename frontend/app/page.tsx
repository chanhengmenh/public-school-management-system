'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { BookOpen, Calendar, BarChart3, MessageSquare, Users, FileText, Settings, ChevronLeft, Bell, Clock, AlertCircle, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMounted, setIsMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const courses = [
    {
      id: 1,
      name: 'Introduction to Computer Science',
      code: 'CS101',
      instructor: 'Dr. Sarah Johnson',
      progress: 65,
      unreadMessages: 3,
    },
    {
      id: 2,
      name: 'Advanced Web Development',
      code: 'WEB201',
      instructor: 'Prof. Michael Chen',
      progress: 82,
      unreadMessages: 1,
    },
    {
      id: 3,
      name: 'Data Science Fundamentals',
      code: 'DS150',
      instructor: 'Dr. Emma Rodriguez',
      progress: 45,
      unreadMessages: 5,
    },
    {
      id: 4,
      name: 'Mobile App Development',
      code: 'MOB301',
      instructor: 'Prof. James Wilson',
      progress: 78,
      unreadMessages: 0,
    },
  ]

  const assignments = [
    {
      id: 1,
      title: 'Midterm Exam - Part 1',
      course: 'CS101',
      dueDate: 'Feb 15, 2026',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Project Presentation Slides',
      course: 'WEB201',
      dueDate: 'Feb 18, 2026',
      status: 'in-progress',
    },
    {
      id: 3,
      title: 'Quiz 3: Networking Basics',
      course: 'MOB301',
      dueDate: 'Feb 20, 2026',
      status: 'pending',
    },
  ]

  const announcements = [
    {
      id: 1,
      course: 'CS101',
      title: 'Midterm Exam Schedule Released',
      date: '2 hours ago',
      isNew: true,
    },
    {
      id: 2,
      course: 'WEB201',
      title: 'Updated Office Hours - New Time',
      date: '1 day ago',
      isNew: true,
    },
    {
      id: 3,
      course: 'DS150',
      title: 'Guest Lecture Next Tuesday',
      date: '3 days ago',
      isNew: false,
    },
  ]

  const navigationItems = [
    { icon: BookOpen, label: 'Dashboard', id: 'dashboard' },
    { icon: Calendar, label: 'Assignments', id: 'assignments' },
    { icon: BarChart3, label: 'Grades', id: 'grades' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Clock, label: 'Attendance', id: 'attendance' },
    { icon: Users, label: 'Ranking', id: 'ranking' },
    { icon: MessageSquare, label: 'Broadcast', id: 'broadcast' },
    { icon: Users, label: 'Monitor', id: 'monitor' },
    { icon: MessageSquare, label: 'Messages', id: 'messages' },
    { icon: FileText, label: 'Files', id: 'files' },
  ]

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
              <div className="text-xs text-muted-foreground">Student</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
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
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                {isMounted && resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                <Switch
                  checked={isMounted && resolvedTheme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  aria-label="Toggle dark mode"
                />
              </div>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold">
              SJ
            </div>
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
                    {courses.map((course) => (
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
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground">Assignments</h2>
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
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
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'grades' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground">Grades</h2>
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Grade Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Your grades across all courses</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {['analytics', 'attendance', 'ranking', 'broadcast', 'monitor', 'messages', 'files'].includes(activeTab) && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground capitalize">{activeTab}</h2>
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="capitalize">{activeTab}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{activeTab} feature content will appear here</p>
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
                    {announcements.map((announcement) => (
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
                    ))}
                  </div>
                </div>

                {/* Due Soon */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Due Soon</h4>
                  <div className="space-y-2">
                    {assignments.slice(0, 2).map((assignment) => (
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
                    ))}
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
