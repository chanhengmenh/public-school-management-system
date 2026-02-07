'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ClassSelector from '@/components/class-selector'
import { apiFetch } from '@/lib/api'

type Subject = {
  id: string
  name: string
  code: string
  description?: string
}

type Assignment = {
  id: string
  title: string
  description?: string
  subject_id: string
  class_id: string
  publisher_id: string
  due_date?: string
  max_score: number
}

type Announcement = {
  id: string
  title: string
  content: string
  created_at: string
}

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [classId, setClassId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<Subject[]>('/api/subjects')
        setSubjects(data)
      } catch {
        setSubjects([])
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (!classId) {
      return
    }

    const load = async () => {
      try {
        const data = await apiFetch<Assignment[]>(`/api/assignments/class/${classId}`)
        setAssignments(data)
      } catch {
        setAssignments([])
      }

      try {
        const data = await apiFetch<Announcement[]>('/api/announcements')
        setAnnouncements(data)
      } catch {
        setAnnouncements([])
      }
    }

    load()
  }, [classId])

  const upcomingAssignments = useMemo(() => {
    return assignments
      .filter((assignment) => assignment.due_date)
      .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
      .slice(0, 4)
  }, [assignments])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of your subjects, assignments, and updates.</p>
        </div>
        <ClassSelector value={classId} onChange={setClassId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects available.</p>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">{subject.code}</p>
                  </div>
                  <Badge variant="outline">Subject</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-md border border-border p-3">
                  <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(announcement.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{announcement.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {classId && upcomingAssignments.length === 0 && (
            <p className="text-sm text-muted-foreground">No upcoming assignments for this class.</p>
          )}
          {!classId && <p className="text-sm text-muted-foreground">Select a class to view assignments.</p>}
          {upcomingAssignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent mt-1" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">Due {new Date(assignment.due_date ?? '').toLocaleString()}</p>
                </div>
              </div>
              <Badge variant="secondary">Max {assignment.max_score}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
