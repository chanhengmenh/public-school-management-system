'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'

const titleMap: Record<string, string> = {
  reports: 'Reports',
  'system-analytics': 'System Analytics',
  submissions: 'Submissions',
  gradebook: 'Gradebook',
  'class-overview': 'Class Overview',
  'class-analytics': 'Class Analytics',
  'student-ranking': 'Student Ranking',
  attendance: 'Attendance',
}

export default function PlaceholderSectionPage() {
  const params = useParams()
  const section = Array.isArray(params.section) ? params.section[0] : params.section

  const title = useMemo(() => {
    return titleMap[section ?? ''] ?? 'Section'
  }, [section])

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">This section is being wired to the API.</p>
    </div>
  )
}
