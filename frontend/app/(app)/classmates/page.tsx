'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import ClassSelector from '@/components/class-selector'
import { apiFetch } from '@/lib/api'

type Student = {
  id: string
  full_name: string
  email: string
}

export default function ClassmatesPage() {
  const [classId, setClassId] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    if (!classId) {
      return
    }

    const load = async () => {
      try {
        const data = await apiFetch<Student[]>(`/api/classes/${classId}/students`)
        setStudents(data)
      } catch {
        setStudents([])
      }
    }

    load()
  }, [classId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Classmates</h2>
          <p className="text-sm text-muted-foreground">Students enrolled in your class.</p>
        </div>
        <ClassSelector value={classId} onChange={setClassId} />
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          {!classId && <p className="text-sm text-muted-foreground">Select a class to view classmates.</p>}
          {classId && students.length === 0 && <p className="text-sm text-muted-foreground">No students found.</p>}
          {students.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{student.full_name}</td>
                    <td className="py-2 text-muted-foreground">{student.email}</td>
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
