'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type User = {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      const data = await apiFetch<User[]>('/api/users')
      setUsers(data)
    } catch {
      setUsers([])
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreate = async () => {
    setError(null)
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email, password, role }),
      })
      setFullName('')
      setEmail('')
      setPassword('')
      await loadUsers()
    } catch {
      setError('Unable to create user. Check permissions.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground">Create and manage user accounts.</p>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" />
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="admin">admin</option>
              <option value="teacher">teacher</option>
              <option value="home_teacher">home_teacher</option>
              <option value="student">student</option>
              <option value="class_monitor">class_monitor</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={!fullName || !email || !password}>
            Create User
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4">
          {users.length === 0 && <p className="text-sm text-muted-foreground">No users found.</p>}
          {users.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{user.full_name}</td>
                    <td className="py-2 text-muted-foreground">{user.email}</td>
                    <td className="py-2 text-muted-foreground">{user.role}</td>
                    <td className="py-2 text-muted-foreground">{user.is_active ? 'Yes' : 'No'}</td>
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
