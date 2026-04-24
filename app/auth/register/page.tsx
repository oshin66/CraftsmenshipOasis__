'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Eye, EyeOff, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = e => reject(e)
})

interface Form {
  name: string; email: string; password: string; confirm: string
  bio: string; skills: string; isSeller: boolean
  paymentQr: File | null
}
type FormErrors = { name?: string; email?: string; password?: string; confirm?: string; paymentQr?: string }
const INIT: Form = { name:'', email:'', password:'', confirm:'', bio:'', skills:'', isSeller:false, paymentQr: null }

const SELLER_PERKS = [
  'Set your own price and packages',
  'Get paid within 48h of delivery',
  'Build your portfolio with real projects',
]
const BUYER_PERKS = [
  'Access 300+ vetted student developers',
  'Transparent pricing, no hidden fees',
  'Managed delivery with quality oversight',
]

export default function RegisterPage() {
  const [form, setForm]     = useState<Form>(INIT)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [toast, setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null)
  const [errors, setErrors]   = useState<FormErrors>({})
  
  const [step, setStep]       = useState<'form' | 'otp'>('form')
  const [otp, setOtp]         = useState('')

  const setField = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm(f => ({ ...f, [k]: v }))
    if (k !== 'isSeller' && k !== 'bio' && k !== 'skills') {
      setErrors(e => ({ ...e, [k]: undefined }))
    }
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address'
    if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters'
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      e.password = 'Password must contain at least one special character'
    }
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    if (form.isSeller && !form.paymentQr) e.paymentQr = 'Payment QR is required for sellers'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSendOtp = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
         setToast({ msg: data.error ?? 'Failed to send OTP', type: 'error' })
         setLoading(false)
         return
      }
      setToast({ msg: 'OTP sent to your email! (Check console for demo)', type: 'success' })
      setStep('otp')
    } catch {
      setToast({ msg: 'Network error. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFinal = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (otp.length !== 6) {
       setToast({ msg: 'Please enter a 6-digit OTP', type: 'error' })
       return
    }
    setLoading(true)
    try {
      let qrBase64 = null
      if (form.isSeller && form.paymentQr) {
        qrBase64 = await toBase64(form.paymentQr)
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          isSeller: form.isSeller,
          bio: form.bio || undefined,
          skills: form.skills || undefined,
          paymentQr: qrBase64 || undefined,
          otp: otp,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setToast({ msg: data.error ?? 'Registration failed', type: 'error' }); return }
      setToast({ msg: 'Account created! Redirecting…', type: 'success' })
      setTimeout(() => window.location.href = form.isSeller ? '/dashboard/seller' : '/dashboard/buyer', 1200)
    } catch {
      setToast({ msg: 'Network error. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const perks = form.isSeller ? SELLER_PERKS : BUYER_PERKS

  return (
    <div className="min-h-screen bg-[var(--paper)] flex">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Left decorative panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-[var(--forest)] p-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 border border-white/30 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4v4L6 11 1 8V4z" stroke="white" strokeWidth="0.75" fill="none" opacity="0.8"/>
              <circle cx="6" cy="6" r="1.5" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <span className="font-display text-[13px] tracking-[2px] uppercase text-white">
            Craftsmanship <span className="opacity-40">Oasis</span>
          </span>
        </Link>

        <div>
          <p className="text-[9px] uppercase tracking-[4px] text-white/40 font-[Jost] font-medium mb-5">Join today</p>
          <h2 className="font-display text-5xl font-light leading-[1.1] text-white mb-8">
            {form.isSeller
              ? <><em className="text-[var(--teal-pale)]">Sell</em> your<br/>skills to<br/>real brands.</>
              : <>Find your<br/>perfect<br/><em className="text-[var(--teal-pale)]">builder.</em></>
            }
          </h2>
          <ul className="space-y-4">
            {perks.map(p => (
              <li key={p} className="flex items-start gap-3 text-[12px] text-white/55 font-[Jost] font-light leading-relaxed">
                <CheckCircle size={13} className="shrink-0 mt-0.5 text-[var(--teal-pale)] opacity-80" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-white/20 font-[Jost]">© 2025 Craftsmanship Oasis</p>
      </div>

      {/* ── Right form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-8 py-16 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-6 h-6 border border-[var(--forest)] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L11 4v4L6 11 1 8V4z" stroke="var(--forest)" strokeWidth="0.75" fill="none"/>
                <circle cx="6" cy="6" r="1.5" fill="var(--forest)" opacity="0.6"/>
              </svg>
            </div>
            <span className="font-display text-[13px] tracking-[2px] uppercase text-[var(--forest)]">Craftsmanship Oasis</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-light text-[var(--charcoal)] mb-2">Create Account</h1>
            <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light">
              Already have one?{' '}
              <Link href="/auth/login" className="text-[var(--forest)] hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex border-[0.5px] border-[var(--line)] mb-8">
            {([false, true] as const).map(s => (
              <button key={String(s)} type="button" onClick={() => setField('isSeller', s)}
                className={`flex-1 py-3 text-[10px] uppercase tracking-[2px] font-medium font-[Jost] transition-colors
                  ${form.isSeller === s
                    ? 'bg-[var(--forest)] text-[var(--paper)]'
                    : 'text-[var(--grey-light)] hover:text-[var(--grey)]'}`}>
                {s ? 'I am a Seller' : 'I am a Buyer'}
              </button>
            ))}
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSendOtp} className="space-y-5 animate-fade" noValidate>
              {/* Name */}
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Full Name
              </label>
              <input required className="input-underline" placeholder="Your full name"
                value={form.name} onChange={e => setField('name', e.target.value)} />
              {errors.name && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Email Address
              </label>
              <input type="email" required className="input-underline" placeholder="you@college.ac.in"
                value={form.email} onChange={e => setField('email', e.target.value)} />
              {errors.email && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required className="input-underline pr-8"
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setField('password', e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors">
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Confirm Password
              </label>
              <input type="password" required className="input-underline" placeholder="Re-enter password"
                value={form.confirm} onChange={e => setField('confirm', e.target.value)} />
              {errors.confirm && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.confirm}</p>}
            </div>

            {/* Seller-only fields */}
            {form.isSeller && (
              <>
                <div className="border-t border-[var(--line)] pt-5">
                  <p className="text-[9px] uppercase tracking-[2px] text-[var(--forest)] font-[Jost] font-medium mb-4">
                    Seller Profile
                  </p>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                    College / University
                  </label>
                  <input className="input-underline" placeholder="IIT Bombay, NIT Trichy..."
                    value={form.bio} onChange={e => setField('bio', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                    Primary Skills
                  </label>
                  <input className="input-underline" placeholder="Python, React, LangChain..."
                    value={form.skills} onChange={e => setField('skills', e.target.value)} />
                  <p className="text-[10px] text-[var(--grey-light)] mt-1.5 font-[Jost]">
                    Comma-separated. Helps buyers discover you.
                  </p>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                    Payment QR Code (Required)
                  </label>
                  <label className="block border-[0.5px] border-dashed border-[var(--line)] p-4 text-center cursor-pointer hover:border-[var(--forest)] transition-colors">
                    <input type="file" className="hidden" accept="image/*" 
                      onChange={e => setField('paymentQr', e.target.files?.[0] ?? null)} />
                    {form.paymentQr ? (
                      <div className="flex items-center justify-center gap-2 text-[var(--forest)] text-[11px] font-[Jost]">
                        <CheckCircle size={14}/> {form.paymentQr.name}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload size={16} className="text-[var(--grey-light)]" />
                        <span className="text-[11px] text-[var(--grey)] font-[Jost]">Upload UPI/Payment QR</span>
                      </div>
                    )}
                  </label>
                  {errors.paymentQr && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.paymentQr}</p>}
                  <p className="text-[9px] text-[var(--grey-light)] mt-2 font-[Jost] italic">
                    Note: For security, buyers will see a verified Oasis QR linked to yours.
                  </p>
                </div>
              </>
            )}

            <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
              {form.isSeller ? 'Request OTP →' : 'Request OTP →'}
            </Button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[1px] bg-[var(--line)]" />
              <span className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] font-[Jost]">Or sign up with</span>
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

            <p className="text-center text-[10px] text-[var(--grey-light)] font-[Jost]">

              By joining you agree to our{' '}
              <Link href="#" className="underline hover:text-[var(--forest)]">Terms</Link>
              {' '}and{' '}
              <Link href="#" className="underline hover:text-[var(--forest)]">Privacy Policy</Link>
            </p>
          </form>
          ) : (
            <form onSubmit={handleSubmitFinal} className="space-y-6 animate-scale-in">
              <div className="text-center mb-6">
                <p className="text-[14px] text-[var(--charcoal)] font-[Jost] font-medium mb-2">Verify your email</p>
                <p className="text-[12px] text-[var(--grey)] font-[Jost]">We've sent a 6-digit OTP to <strong className="text-[var(--forest)]">{form.email}</strong>.</p>
              </div>
              
              <div>
                <input 
                  type="text" 
                  maxLength={6}
                  required 
                  className="input-underline text-center text-xl tracking-[10px]" 
                  placeholder="------"
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep('form')} disabled={loading}>
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1" loading={loading}>
                  Complete Registration
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
