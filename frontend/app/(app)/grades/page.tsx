'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ClassSelector from '@/components/class-selector'
import { apiFetch } from '@/lib/api'
import { useAppContext } from '@/components/app-shell'

type GradeItem = {
  assignment_title: string
  max_score: number
  score: number
  feedback?: string
  graded_at?: string
  submitted_at?: string
  status?: string
  percentage?: number
}

export default function GradesPage() {
  const { userId } = useAppContext()
  const [classId, setClassId] = useState<string | null>(null)
  const [grades, setGrades] = useState<GradeItem[]>([])

  useEffect(() => {
    if (!classId || !userId) {
      return
    }

    const load = async () => {
      try {
        const data = await apiFetch<GradeItem[]>(`/api/grading/student/${userId}/class/${classId}`)
        setGrades(data)
      } catch {
        setGrades([])
      }
    }

    load()
  }, [classId, userId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Grades</h2>
          <p className="text-sm text-muted-foreground">Review your scores and feedback.</p>
        </div>
        <ClassSelector value={classId} onChange={setClassId} />
      </div>

      <div className="space-y-3">
        {!classId && <p className="text-sm text-muted-foreground">Select a class to view grades.</p>}
        {classId && grades.length === 0 && <p className="text-sm text-muted-foreground">No grades available.</p>}
        {grades.map((grade) => (
          <Card key={`${grade.assignment_title}-${grade.graded_at}`} className="border-border">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{grade.assignment_title}</p>
                <Badge variant="secondary">{grade.percentage ?? 0}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Score {grade.score} / {grade.max_score} · {grade.status ?? 'submitted'}
              </p>
              {grade.feedback && <p className="text-sm text-muted-foreground">Feedback: {grade.feedback}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
