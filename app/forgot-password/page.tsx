'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setToast({ msg: data.message, type: 'success' })
      } else {
        setToast({ msg: data.error || 'Something went wrong', type: 'error' })
      }
    } catch (err) {
      setToast({ msg: 'Connection failed. Please check your network.', type: 'error' })
    } finally {
      setLoading(false)
    }
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
          <h1 className="font-display text-[34px] font-light text-[var(--charcoal)]">Reset access.</h1>
          <p className="text-[12px] text-[var(--grey)] mt-2 font-[Jost]">Enter your email to receive recovery instructions</p>
        </div>

        <div className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] p-8 relative">
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-[var(--forest)]" />
          
          {submitted ? (
            <div className="text-center py-6">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--paper-dark)] border-[0.5px] border-[var(--forest)] text-[var(--forest)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-display text-[20px] text-[var(--charcoal)] mb-3">Link Sent</h2>
              <p className="text-[11px] text-[var(--grey)] font-[Jost] leading-relaxed mb-8 px-4">
                We have sent an email to <strong className="text-[var(--charcoal)]">{email}</strong>. If an account exists, you will find instructions to reset your password.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" size="sm" className="w-full">
                Try Another Email →
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-2" noValidate>
              <div>
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-4 font-[Jost] font-medium">
                  Email Address
                </label>
                <input 
                  type="email" 
                  className="input-underline" 
                  placeholder="you@example.com"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-4">
                <Button type="submit" size="lg" loading={loading} className="w-full">
                  Request Reset Link →
                </Button>
                
                <Link 
                  href="/auth/login" 
                  className="text-center text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors py-2"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          <div className="mt-8 p-4 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)]">
            <p className="text-[10px] text-[var(--grey)] font-[Jost] leading-relaxed">
              For security, if you don&apos;t see the email within 10 minutes, check your spam folder or try requesting a new link.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors">
            ← Home
          </Link>
        </div>
      </div>
    </div>
  )
}
