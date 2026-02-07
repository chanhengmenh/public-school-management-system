'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

export type ClassItem = {
  id: string
  name: string
  academic_year: string
}

export default function ClassSelector({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [classes, setClasses] = useState<ClassItem[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<ClassItem[]>('/api/classes')
        setClasses(data)
        if (data.length > 0 && !value) {
          onChange(data[0].id)
        }
      } catch {
        setClasses([])
      }
    }

    load()
  }, [])

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase">Class</label>
      <select
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="" disabled>
          Select a class
        </option>
        {classes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} ({item.academic_year})
          </option>
        ))}
      </select>
    </div>
  )
}
