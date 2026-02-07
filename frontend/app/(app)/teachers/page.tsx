'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import ClassSelector from '@/components/class-selector'
import { apiFetch } from '@/lib/api'

type TeacherSubject = {
  id: string
  name: string
  code: string
  teacher_name: string
  teacher_email: string
}

export default function TeachersPage() {
  const [classId, setClassId] = useState<string | null>(null)
  const [teachers, setTeachers] = useState<TeacherSubject[]>([])

  useEffect(() => {
    if (!classId) {
      return
    }

    const load = async () => {
      try {
        const data = await apiFetch<TeacherSubject[]>(`/api/subjects/class/${classId}`)
        setTeachers(data)
      } catch {
        setTeachers([])
      }
    }

    load()
  }, [classId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Teachers</h2>
          <p className="text-sm text-muted-foreground">Teachers and assigned subjects.</p>
        </div>
        <ClassSelector value={classId} onChange={setClassId} />
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          {!classId && <p className="text-sm text-muted-foreground">Select a class to view teachers.</p>}
          {classId && teachers.length === 0 && <p className="text-sm text-muted-foreground">No teachers assigned.</p>}
          {teachers.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Subject</th>
                  <th className="py-2">Teacher</th>
                  <th className="py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{teacher.name}</td>
                    <td className="py-2 text-muted-foreground">{teacher.teacher_name}</td>
                    <td className="py-2 text-muted-foreground">{teacher.teacher_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
