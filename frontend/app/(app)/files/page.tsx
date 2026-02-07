'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type ResourceFile = {
  file_path: string
  file_type?: string
  file_size?: number
}

type Resource = {
  id: string
  title: string
  description?: string
  subject_id?: string
  visibility?: string
  files: ResourceFile[]
}

type Subject = {
  id: string
  name: string
}

export default function FilesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [filePaths, setFilePaths] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadResources = async () => {
    try {
      const data = await apiFetch<Resource[]>('/api/files')
      setResources(data)
    } catch {
      setResources([])
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<Subject[]>('/api/subjects')
        setSubjects(data)
        if (data.length > 0 && !subjectId) {
          setSubjectId(data[0].id)
        }
      } catch {
        setSubjects([])
      }
    }

    load()
    loadResources()
  }, [])

  const handleCreate = async () => {
    setError(null)
    setIsSaving(true)

    try {
      const files = filePaths
        .split(',')
        .map((path) => path.trim())
        .filter(Boolean)
        .map((path) => ({ file_path: path }))

      await apiFetch('/api/files', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || null,
          subject_id: subjectId || null,
          files,
        }),
      })

      setTitle('')
      setDescription('')
      setFilePaths('')
      await loadResources()
    } catch {
      setError('Unable to upload resource. Check permissions.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Files</h2>
        <p className="text-sm text-muted-foreground">Upload and share learning resources.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Resource title" />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
            />
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            value={filePaths}
            onChange={(event) => setFilePaths(event.target.value)}
            placeholder="File paths (comma-separated)"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={isSaving || !title}>
            {isSaving ? 'Saving...' : 'Upload Resource'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="border-border">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">{resource.title}</p>
              {resource.description && <p className="text-sm text-muted-foreground">{resource.description}</p>}
              <div className="space-y-1">
                {resource.files.map((file) => (
                  <p key={file.file_path} className="text-xs text-muted-foreground">
                    {file.file_path}
                  </p>
                ))}
                {resource.files.length === 0 && <p className="text-xs text-muted-foreground">No files listed.</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {resources.length === 0 && <p className="text-sm text-muted-foreground">No resources available.</p>}
      </div>
    </div>
  )
}
