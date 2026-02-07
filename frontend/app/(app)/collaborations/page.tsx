'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type Space = {
  id: string
  name: string
  description?: string
  member_count: number
}

type Post = {
  id: string
  author_id: string
  content: string
  created_at: string
}

export default function CollaborationsPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [activeSpace, setActiveSpace] = useState<Space | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberIds, setMemberIds] = useState('')
  const [postContent, setPostContent] = useState('')

  const loadSpaces = async () => {
    try {
      const data = await apiFetch<Space[]>('/api/collaborations')
      setSpaces(data)
      if (data.length > 0 && !activeSpace) {
        setActiveSpace(data[0])
      }
    } catch {
      setSpaces([])
    }
  }

  useEffect(() => {
    loadSpaces()
  }, [])

  useEffect(() => {
    if (!activeSpace) {
      setPosts([])
      return
    }

    const load = async () => {
      try {
        const data = await apiFetch<Post[]>(`/api/collaborations/${activeSpace.id}/posts`)
        setPosts(data)
      } catch {
        setPosts([])
      }
    }

    load()
  }, [activeSpace])

  const handleCreateSpace = async () => {
    const members = memberIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    await apiFetch('/api/collaborations', {
      method: 'POST',
      body: JSON.stringify({ name, description: description || null, member_ids: members }),
    })

    setName('')
    setDescription('')
    setMemberIds('')
    await loadSpaces()
  }

  const handleCreatePost = async () => {
    if (!activeSpace) {
      return
    }

    await apiFetch(`/api/collaborations/${activeSpace.id}/posts`, {
      method: 'POST',
      body: JSON.stringify({ content: postContent }),
    })

    setPostContent('')
    const data = await apiFetch<Post[]>(`/api/collaborations/${activeSpace.id}/posts`)
    setPosts(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Collaborations</h2>
        <p className="text-sm text-muted-foreground">Shared spaces for group work.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Space name" />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
            />
            <Input
              value={memberIds}
              onChange={(event) => setMemberIds(event.target.value)}
              placeholder="Member IDs (comma-separated)"
            />
            <Button onClick={handleCreateSpace} disabled={!name}>
              Create Space
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        <Card className="border-border">
          <CardContent className="p-4 space-y-2">
            {spaces.map((space) => (
              <button
                key={space.id}
                onClick={() => setActiveSpace(space)}
                className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                  activeSpace?.id === space.id
                    ? 'border-secondary bg-secondary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <p className="font-semibold text-foreground">{space.name}</p>
                <p className="text-xs text-muted-foreground">Members {space.member_count}</p>
              </button>
            ))}
            {spaces.length === 0 && <p className="text-sm text-muted-foreground">No spaces yet.</p>}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            {activeSpace ? (
              <>
                <div className="space-y-2">
                  {posts.map((post) => (
                    <div key={post.id} className="rounded-md border border-border p-3">
                      <p className="text-sm text-foreground">{post.content}</p>
                      <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                  {posts.length === 0 && <p className="text-sm text-muted-foreground">No updates yet.</p>}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={postContent}
                    onChange={(event) => setPostContent(event.target.value)}
                    placeholder="Share an update"
                  />
                  <Button onClick={handleCreatePost} disabled={!postContent}>
                    Post
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a space to view updates.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
