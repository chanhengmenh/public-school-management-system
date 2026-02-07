'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type ClassItem = {
  id: string
  name: string
  academic_year: string
  home_teacher_id?: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [name, setName] = useState('')
  const [year, setYear] = useState('2026')
  const [homeTeacherId, setHomeTeacherId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadClasses = async () => {
    try {
      const data = await apiFetch<ClassItem[]>('/api/classes')
      setClasses(data)
    } catch {
      setClasses([])
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  const handleCreate = async () => {
    setError(null)
    try {
      await apiFetch('/api/classes', {
        method: 'POST',
        body: JSON.stringify({
          name,
          academic_year: year,
          home_teacher_id: homeTeacherId || null,
        }),
      })
      setName('')
      setHomeTeacherId('')
      await loadClasses()
    } catch {
      setError('Unable to create class. Check permissions.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Classes</h2>
        <p className="text-sm text-muted-foreground">Manage class groups and homeroom assignments.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Class name" />
            <Input value={year} onChange={(event) => setYear(event.target.value)} placeholder="Academic year" />
            <Input
              value={homeTeacherId}
              onChange={(event) => setHomeTeacherId(event.target.value)}
              placeholder="Home teacher id"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={!name || !year}>
            Create Class
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {classes.map((item) => (
          <Card key={item.id} className="border-border">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">Year {item.academic_year}</p>
            </CardContent>
          </Card>
        ))}
        {classes.length === 0 && <p className="text-sm text-muted-foreground">No classes found.</p>}
      </div>
    </div>
  )
}
