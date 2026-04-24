'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setToast({ msg: 'Invalid or missing reset token.', type: 'error' })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setToast({ msg: 'Passwords do not match', type: 'error' })
    }
    if (password.length < 8) {
      return setToast({ msg: 'Password must be at least 8 characters', type: 'error' })
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return setToast({ msg: 'Password must contain at least one special character', type: 'error' })
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setToast({ msg: 'Password updated successfully!', type: 'success' })
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        setToast({ msg: data.error || 'Something went wrong', type: 'error' })
      }
    } catch (err) {
      setToast({ msg: 'Connection failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md border-[0.5px] border-[var(--line)] bg-[var(--paper)] p-12 relative">
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-[var(--forest)]" />
          <div className="w-12 h-12 border border-[var(--forest)] flex items-center justify-center mx-auto mb-8">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          </div>
          <h1 className="font-display text-[24px] text-[var(--charcoal)] mb-4">Complete.</h1>
          <p className="text-[12px] text-[var(--grey)] font-[Jost] mb-8 px-4 leading-relaxed">
            Your credentials have been updated. We are redirecting you to sign in...
          </p>
          <Link href="/auth/login">
            <Button variant="outline" size="sm" className="w-full">
              Sign In Now →
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-7 h-7 border border-[var(--forest)] flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L11 4v4L6 11 1 8V4z" stroke="var(--forest)" strokeWidth="0.75" fill="none"/>
                <circle cx="6" cy="6" r="1.5" fill="var(--forest)" opacity="0.6"/>
              </svg>
            </div>
            <span className="font-display text-[14px] tracking-[2px] uppercase text-[var(--forest)]">
              Craftsmanship Oasis
            </span>
          </Link>
          <h1 className="font-display text-[34px] font-light text-[var(--charcoal)]">Security Update.</h1>
          <p className="text-[12px] text-[var(--grey)] mt-2 font-[Jost]">Establish your new access credentials</p>
        </div>

        <div className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] p-8 relative">
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-[var(--forest)]" />
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2" noValidate>
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                New Password
              </label>
              <div className="relative">
                <input 
                  type={showPw ? 'text' : 'password'} 
                  className="input-underline pr-8"
                  placeholder="••••••••"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--grey-light)] hover:text-[var(--forest)]"
                >
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Confirm Password
              </label>
              <input 
                type={showPw ? 'text' : 'password'} 
                className="input-underline"
                placeholder="••••••••"
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            <Button type="submit" size="lg" loading={loading} disabled={!token} className="w-full mt-4">
              Update Password →
            </Button>
          </form>

          {!token && (
            <div className="mt-8 p-4 bg-red-500/5 border-[0.5px] border-red-200">
               <p className="text-[10px] text-red-600 font-[Jost] leading-relaxed">
                This reset link is missing or invalid. Please request a new link from the <Link href="/forgot-password" className="underline font-medium">forgot password page</Link>.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/auth/login" className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors">
            ← Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
