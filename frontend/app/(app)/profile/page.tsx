'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = async () => {
    try {
      const data = await apiFetch<Profile>('/api/profile')
      setProfile(data)
      setFullName(data.full_name)
      setEmail(data.email)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleUpdate = async () => {
    setError(null)
    setIsSaving(true)

    try {
      await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName, email }),
      })
      await loadProfile()
    } catch {
      setError('Unable to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Update your account details.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          {profile && <p className="text-xs text-muted-foreground">Role: {profile.role}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleUpdate} disabled={isSaving || !fullName || !email}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
