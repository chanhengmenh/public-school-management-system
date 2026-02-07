'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ClassSelector from '@/components/class-selector'
import { apiFetch } from '@/lib/api'

type Subject = {
  id: string
  name: string
}

type Assignment = {
  id: string
  title: string
  description?: string
  subject_id: string
  class_id: string
  due_date?: string
  max_score: number
  allowed_submission_types: string[]
}

export default function AssignmentsPage() {
  const [classId, setClassId] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [maxScore, setMaxScore] = useState('100')
  const [allowedTypes, setAllowedTypes] = useState<string[]>(['text'])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSubjects = async () => {
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

    loadSubjects()
  }, [])

  useEffect(() => {
    if (!classId) {
      return
    }

    const loadAssignments = async () => {
      try {
        const data = await apiFetch<Assignment[]>(`/api/assignments/class/${classId}`)
        setAssignments(data)
      } catch {
        setAssignments([])
      }
    }

    loadAssignments()
  }, [classId])

  const toggleType = (value: string) => {
    setAllowedTypes((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleCreate = async () => {
    if (!classId || !subjectId) {
      setError('Select a class and subject first.')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      await apiFetch('/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || null,
          subject_id: subjectId,
          class_id: classId,
          due_date: dueDate || null,
          max_score: Number(maxScore || 100),
          allowed_submission_types: allowedTypes.length > 0 ? allowedTypes : ['text'],
        }),
      })

      setTitle('')
      setDescription('')
      setDueDate('')
      setMaxScore('100')
      setAllowedTypes(['text'])

      const data = await apiFetch<Assignment[]>(`/api/assignments/class/${classId}`)
      setAssignments(data)
    } catch {
      setError('Unable to create assignment. Check permissions.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Assignments</h2>
          <p className="text-sm text-muted-foreground">Create, view, and manage assignments.</p>
        </div>
        <ClassSelector value={classId} onChange={setClassId} />
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Assignment title" />
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
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
            <Input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            <Input
              type="number"
              min={0}
              value={maxScore}
              onChange={(event) => setMaxScore(event.target.value)}
              placeholder="Max score"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['text', 'file'].map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={allowedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                />
                {type}
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={isSaving || !title || !classId || !subjectId}>
            {isSaving ? 'Saving...' : 'Create Assignment'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="border-border">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{assignment.title}</p>
                <Badge variant="secondary">Max {assignment.max_score}</Badge>
              </div>
              {assignment.description && <p className="text-sm text-muted-foreground">{assignment.description}</p>}
              <p className="text-xs text-muted-foreground">
                Due {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'No due date'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
