'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ClassSelector from '@/components/class-selector'
import { apiFetch } from '@/lib/api'

type Student = {
  id: string
  full_name: string
  email: string
}

type AttendanceRecord = {
  student_id: string
  student_name: string
  student_email: string
  status: string
  notes?: string
}

const statusOptions = ['present', 'late', 'absent', 'permission']

export default function AttendancePage() {
  const [classId, setClassId] = useState<string | null>(null)
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState<Student[]>([])
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!classId) {
      return
    }

    const loadStudents = async () => {
      try {
        const data = await apiFetch<Student[]>(`/api/classes/${classId}/students`)
        setStudents(data)
      } catch {
        setStudents([])
      }
    }

    loadStudents()
  }, [classId])

  useEffect(() => {
    if (!classId) {
      return
    }

    const loadAttendance = async () => {
      try {
        const data = await apiFetch<{ records: AttendanceRecord[] }>(
          `/api/attendance/class/${classId}/session?date=${date}`
        )
        const map: Record<string, AttendanceRecord> = {}
        data.records.forEach((record) => {
          map[record.student_id] = record
        })
        setRecords(map)
      } catch {
        setRecords({})
      }
    }

    loadAttendance()
  }, [classId, date])

  const rows = useMemo(() => {
    return students.map((student) => {
      const record = records[student.id]
      return {
        student,
        status: record?.status ?? 'present',
        notes: record?.notes ?? '',
      }
    })
  }, [students, records])

  const updateRecord = (studentId: string, updates: Partial<AttendanceRecord>) => {
    setRecords((prev) => {
      const current = prev[studentId]
      return {
        ...prev,
        [studentId]: {
          student_id: studentId,
          student_name: current?.student_name ?? '',
          student_email: current?.student_email ?? '',
          status: current?.status ?? 'present',
          notes: current?.notes ?? '',
          ...updates,
        },
      }
    })
  }

  const handleSave = async () => {
    if (!classId) {
      return
    }

    setIsSaving(true)
    try {
      const payload = rows.map((row) => ({
        student_id: row.student.id,
        status: row.status,
        notes: row.notes || null,
      }))

      await apiFetch(`/api/attendance/class/${classId}/session`, {
        method: 'POST',
        body: JSON.stringify({ date, records: payload }),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Attendance</h2>
          <p className="text-sm text-muted-foreground">Track present, late, absent, or permission status.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <ClassSelector value={classId} onChange={setClassId} />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          {!classId && <p className="text-sm text-muted-foreground">Select a class to take attendance.</p>}
          {classId && rows.length === 0 && <p className="text-sm text-muted-foreground">No students found.</p>}
          {rows.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Student</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.student.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{row.student.full_name}</td>
                    <td className="py-2 text-muted-foreground">{row.student.email}</td>
                    <td className="py-2">
                      <select
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                        value={row.status}
                        onChange={(event) => updateRecord(row.student.id, { status: event.target.value })}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <input
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                        value={row.notes}
                        onChange={(event) => updateRecord(row.student.id, { notes: event.target.value })}
                        placeholder="Notes"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {classId && rows.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      )}
    </div>
  )
}
