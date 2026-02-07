'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import ClassSelector from '@/components/class-selector'
import { apiFetch } from '@/lib/api'

type ClassAnalytics = {
  class_id: string
  class_name: string
  total_students: number
  average_score: number
  highest_score: number
  lowest_score: number
  completion_rate: number
}

type Ranking = {
  student_id: string
  student_name: string
  total_points: number
  average_score: number
  rank: number
  total_assignments: number
}

export default function AnalyticsPage() {
  const [classId, setClassId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null)
  const [rankings, setRankings] = useState<Ranking[]>([])

  useEffect(() => {
    if (!classId) {
      return
    }

    const load = async () => {
      try {
        const data = await apiFetch<ClassAnalytics>(`/api/analytics/class/${classId}/analytics`)
        setAnalytics(data)
      } catch {
        setAnalytics(null)
      }

      try {
        const data = await apiFetch<Ranking[]>(`/api/analytics/class/${classId}/rankings`)
        setRankings(data)
      } catch {
        setRankings([])
      }
    }

    load()
  }, [classId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Class performance and rankings.</p>
        </div>
        <ClassSelector value={classId} onChange={setClassId} />
      </div>

      {!classId && <p className="text-sm text-muted-foreground">Select a class to view analytics.</p>}

      {analytics && (
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Average Score</p>
              <p className="text-xl font-semibold text-foreground">{analytics.average_score}%</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <p className="text-xl font-semibold text-foreground">{analytics.completion_rate}%</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="text-xl font-semibold text-foreground">{analytics.total_students}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Rankings</p>
          {rankings.length === 0 && <p className="text-sm text-muted-foreground">No rankings available.</p>}
          {rankings.map((rank) => (
            <div key={rank.student_id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">#{rank.rank} {rank.student_name}</p>
                <p className="text-xs text-muted-foreground">Assignments {rank.total_assignments}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{rank.average_score}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
