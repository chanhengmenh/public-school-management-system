'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type Announcement = {
  id: string
  title: string
  content: string
  target_audience?: string
  created_at: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const loadAnnouncements = async () => {
    try {
      const data = await apiFetch<Announcement[]>('/api/announcements')
      setAnnouncements(data)
    } catch {
      setAnnouncements([])
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleCreate = async () => {
    setError(null)
    try {
      await apiFetch('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, content, target_audience: audience }),
      })
      setTitle('')
      setContent('')
      await loadAnnouncements()
    } catch {
      setError('Unable to create announcement. Check permissions.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Announcements</h2>
        <p className="text-sm text-muted-foreground">Share updates with the school community.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
            <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Message" />
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              <option value="all">all</option>
              <option value="students">students</option>
              <option value="teachers">teachers</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={!title || !content}>
            Create Announcement
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="border-border">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
              <p className="text-sm text-muted-foreground">{announcement.content}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(announcement.created_at).toLocaleString()} · {announcement.target_audience}
              </p>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
      </div>
    </div>
  )
}
