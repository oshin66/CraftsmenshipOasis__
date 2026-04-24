'use client'
import { useEffect, useState } from 'react'

interface SessionUser {
  userId: string
  name:   string
  email:  string
  role:   'BUYER' | 'SELLER' | 'ADMIN'
  isSeller: boolean
}

export function useAuth(requiredRole?: 'BUYER' | 'SELLER' | 'ADMIN') {
  const [user, setUser]       = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) {
          window.location.href = '/auth/login'
          return
        }
        const u = data.data?.user
        if (!u) { window.location.href = '/auth/login'; return }
        if (requiredRole && u.role !== requiredRole && u.role !== 'ADMIN') {
          window.location.href = '/'
          return
        }
        setUser({ userId: u.id, name: u.name, email: u.email, role: u.role, isSeller: u.isSeller })
        setLoading(false)
      })
      .catch(() => { window.location.href = '/auth/login' })
  }, [requiredRole])

  return { user, loading }
}
