'use client'
import { useEffect, useState } from 'react'

interface SessionUser {
  id: string
  name: string
  email:  string
  role:   'BUYER' | 'SELLER' | 'ADMIN'
  isSeller: boolean
}

export function useSimpleAuth() {
  const [user, setUser]       = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const u = data?.data?.user
        if (u) {
          setUser({ id: u.id, name: u.name, email: u.email, role: u.role, isSeller: u.isSeller })
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return { user, loading }
}
