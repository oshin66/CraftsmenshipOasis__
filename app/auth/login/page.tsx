'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [toast, setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToast({ msg: data.error ?? 'Invalid credentials', type: 'error' })
        setLoading(false)
        return
      }
      // Use window.location for full page reload so cookie is processed before navigation
      const role = data.data?.user?.role
      const dest =
        role === 'ADMIN'  ? '/admin' :
        role === 'SELLER' ? '/dashboard/seller' :
                            '/dashboard/buyer'
      window.location.href = dest
    } catch {
      setToast({ msg: 'Network error. Please try again.', type: 'error' })
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
          <h1 className="font-display text-[34px] font-light text-[var(--charcoal)]">Welcome back.</h1>
          <p className="text-[12px] text-[var(--grey)] mt-2 font-[Jost]">Sign in to your account</p>
        </div>

        <div className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] p-8 relative">
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-[var(--forest)]" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2" noValidate>
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Email Address
              </label>
              <input type="email" className="input-underline" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-underline pr-8"
                  placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--grey-light)] hover:text-[var(--forest)]">
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] uppercase tracking-[1.5px] text-[var(--grey-light)] hover:text-[var(--forest)] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign In →
            </Button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1px] bg-[var(--line)]" />
            <span className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] font-[Jost]">Or continue with</span>
            <div className="flex-1 h-[1px] bg-[var(--line)]" />
          </div>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full flex items-center justify-center gap-2 mb-2"
            onClick={() => window.location.href = '/api/auth/google'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>

          <div className="mt-6 p-4 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)]">
            <p className="text-[10px] text-[var(--grey)] font-[Jost] leading-relaxed">
              Don&apos;t have an account? Create a <strong className="font-medium">Buyer</strong> account to browse and buy services, or a <strong className="font-medium">Seller</strong> account to offer your craftsmanship.
            </p>
          </div>

          <p className="text-center text-[11px] text-[var(--grey)] mt-6 font-[Jost]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[var(--forest)] hover:underline">
              Register free
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
