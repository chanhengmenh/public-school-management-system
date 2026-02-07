'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type Thread = {
  id: string
  subject: string
  created_at: string
  member_count: number
}

type Message = {
  id: string
  sender_id: string
  body: string
  created_at: string
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [subject, setSubject] = useState('')
  const [memberIds, setMemberIds] = useState('')
  const [messageBody, setMessageBody] = useState('')

  const loadThreads = async () => {
    try {
      const data = await apiFetch<Thread[]>('/api/messages/threads')
      setThreads(data)
      if (data.length > 0 && !activeThread) {
        setActiveThread(data[0])
      }
    } catch {
      setThreads([])
    }
  }

  useEffect(() => {
    loadThreads()
  }, [])

  useEffect(() => {
    if (!activeThread) {
      setMessages([])
      return
    }

    const load = async () => {
      try {
        const data = await apiFetch<Message[]>(`/api/messages/threads/${activeThread.id}/messages`)
        setMessages(data)
      } catch {
        setMessages([])
      }
    }

    load()
  }, [activeThread])

  const handleCreateThread = async () => {
    const members = memberIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    await apiFetch('/api/messages/threads', {
      method: 'POST',
      body: JSON.stringify({ subject, member_ids: members }),
    })

    setSubject('')
    setMemberIds('')
    await loadThreads()
  }

  const handleSendMessage = async () => {
    if (!activeThread) {
      return
    }

    await apiFetch(`/api/messages/threads/${activeThread.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body: messageBody }),
    })

    setMessageBody('')
    const data = await apiFetch<Message[]>(`/api/messages/threads/${activeThread.id}/messages`)
    setMessages(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Messages</h2>
        <p className="text-sm text-muted-foreground">Start conversations and follow up on threads.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Thread subject" />
            <Input
              value={memberIds}
              onChange={(event) => setMemberIds(event.target.value)}
              placeholder="Member IDs (comma-separated)"
            />
            <Button onClick={handleCreateThread} disabled={!subject}>
              Create Thread
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        <Card className="border-border">
          <CardContent className="p-4 space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread)}
                className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                  activeThread?.id === thread.id
                    ? 'border-secondary bg-secondary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <p className="font-semibold text-foreground">{thread.subject}</p>
                <p className="text-xs text-muted-foreground">Members {thread.member_count}</p>
              </button>
            ))}
            {threads.length === 0 && <p className="text-sm text-muted-foreground">No threads yet.</p>}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            {activeThread ? (
              <>
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-md border border-border p-3">
                      <p className="text-sm text-foreground">{message.body}</p>
                      <p className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder="Write a message"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageBody}>
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a thread to view messages.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
