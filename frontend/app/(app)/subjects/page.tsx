'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type Subject = {
  id: string
  name: string
  code: string
  description?: string
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadSubjects = async () => {
    try {
      const data = await apiFetch<Subject[]>('/api/subjects')
      setSubjects(data)
    } catch {
      setSubjects([])
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  const handleCreate = async () => {
    setError(null)
    setIsSaving(true)

    try {
      await apiFetch('/api/subjects', {
        method: 'POST',
        body: JSON.stringify({ name, code, description: description || null }),
      })
      setName('')
      setCode('')
      setDescription('')
      await loadSubjects()
    } catch (err) {
      setError('Unable to create subject. Check permissions.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Subjects</h2>
        <p className="text-sm text-muted-foreground">Manage subjects offered across classes.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Subject name" />
            <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code" />
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={isSaving || !name || !code}>
            {isSaving ? 'Saving...' : 'Add Subject'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {subjects.map((subject) => (
          <Card key={subject.id} className="border-border">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground">{subject.name}</p>
              <p className="text-xs text-muted-foreground">{subject.code}</p>
              {subject.description && <p className="text-sm text-muted-foreground mt-2">{subject.description}</p>}
            </CardContent>
          </Card>
        ))}
        {subjects.length === 0 && <p className="text-sm text-muted-foreground">No subjects found.</p>}
      </div>
    </div>
  )
}
