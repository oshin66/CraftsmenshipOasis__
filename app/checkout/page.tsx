'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Clock, Upload, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

import { toBase64 } from '@/lib/fileUtils'

const UPI_ID   = 'craftsmanship.oasis@upi'
const UPI_NAME = 'Craftsmanship Oasis'
type PaymentStep = 'summary' | 'payment' | 'pending'

function CheckoutInner() {
  const params      = useSearchParams()
  const gigId       = params.get('gigId')
  const tier        = params.get('tier') ?? 'standard'
  const price       = Number(params.get('price') ?? 7000)
  const orderId     = params.get('orderId')
  
  const [gig, setGig]         = useState<any>(null)
  const [step, setStep]       = useState<PaymentStep>('summary')
  const [txnId, setTxnId]     = useState('')
  const [screenshot, setScr]  = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (gigId) {
      fetch(`/api/gigs/${gigId}`)
        .then(r => r.json())
        .then(d => d?.gig && setGig(d.gig))
        .catch(() => {})
    }
  }, [gigId])

  const platformFee = Math.round(price * 0.1)
  const total       = price + platformFee

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txnId.trim()) { setToast('Please enter your transaction ID'); return }
    setLoading(true)
    try {
      if (orderId) {
        let screenshotBase64 = null
        if (screenshot) {
          try {
            screenshotBase64 = await toBase64(screenshot)
          } catch (e) {
            console.error('Failed to convert image', e)
          }
        }

        const res = await fetch(`/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId, 
            transactionId: txnId,
            screenshot: screenshotBase64 
          }),
        })
        
        if (!res.ok) {
          const d = await res.json()
          setToast(d.error || 'Payment submission failed')
          setLoading(false)
          return
        }
      }
    } catch (e) {
      setToast('Connection error. Please try again.')
      setLoading(false)
      return
    }
    setLoading(false)
    setStep('pending')
  }

  if (step === 'pending') {
    return (
      <PendingState
        orderId={orderId || ''}
        tier={tier}
        total={total}
        gigTitle={gig?.title || 'Your Gig'}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar />
      {toast && <Toast message={toast} type="error" onClose={() => setToast(null)}/>}
      <div className="max-w-4xl mx-auto px-8 py-12 pt-24">
        <div className="mb-8">
          <p className="text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] font-medium font-[Jost] mb-1">Checkout</p>
          <h1 className="font-display text-4xl font-light text-[var(--charcoal)]">Complete Your <em>Order</em></h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-10 pb-8 border-b border-[var(--line)]">
          {[{ label: 'Summary', key: 'summary' }, { label: 'Payment', key: 'payment' }, { label: 'Confirmed', key: 'pending' }].map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 flex items-center justify-center border text-[11px] font-medium font-[Jost]
                  ${step === s.key ? 'bg-[var(--forest)] border-[var(--forest)] text-[var(--paper)]' : 'border-[var(--grey-light)] text-[var(--grey-light)]'}`}>
                  {i + 1}
                </div>
                <span className={`text-[9px] uppercase tracking-[1.5px] font-[Jost] font-medium ${step===s.key?'text-[var(--forest)]':'text-[var(--grey-light)]'}`}>{s.label}</span>
              </div>
              {i < 2 && <div className="w-20 h-[0.5px] bg-[var(--line)] mb-4 mx-2"/>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {step === 'summary' && (
              <div className="animate-rise">
                <h2 className="font-display text-2xl font-light text-[var(--charcoal)] mb-6">Order Summary</h2>
                <div className="border-[0.5px] border-[var(--line)] p-6 mb-6">
                  <div className="h-[2px] bg-[var(--forest)] -mx-6 -mt-6 mb-6"/>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-[var(--paper-dark)] flex items-center justify-center shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-30"><path d="M12 2L22 7v10L12 22 2 17V7z" stroke="#1B3D2F" strokeWidth="1"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[2px] text-[var(--forest)] font-medium font-[Jost] mb-1">{tier.toUpperCase()} PACKAGE</p>
                      <h3 className="text-[14px] font-medium text-[var(--charcoal)] font-[Jost] mb-1">{gig?.title || 'Loading gig…'}</h3>
                      <p className="text-[12px] text-[var(--grey)] font-[Jost] font-light">by {gig?.seller?.name || 'Seller'} · {gig?.deliveryDays || 7} days delivery</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] p-4 flex gap-3 mb-8">
                  <Shield size={16} className="text-[var(--forest)] shrink-0 mt-0.5"/>
                  <p className="text-[12px] text-[var(--grey)] leading-relaxed font-[Jost] font-light">
                    Your payment is held securely until you are satisfied with the delivery. Payment is released to the seller only after you approve the work.
                  </p>
                </div>
                <Button size="lg" onClick={() => setStep('payment')}>Continue to Payment →</Button>
              </div>
            )}

            {step === 'payment' && (
              <div className="animate-rise">
                <h2 className="font-display text-2xl font-light text-[var(--charcoal)] mb-2">UPI Payment</h2>
                <p className="text-[13px] text-[var(--grey)] mb-8 font-[Jost] font-light">
                  Scan the QR code below with any UPI app and pay exactly <strong className="font-medium text-[var(--charcoal)]">₹{total.toLocaleString()}</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-8 mb-8">
                  <div className="border-[0.5px] border-[var(--line)] p-6 flex flex-col items-center gap-4 bg-white rounded-lg shadow-sm">
                    <div className="relative">
                      <svg width="180" height="180" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className="animate-fade">
                        <rect width="160" height="160" fill="white"/>
                        <rect x="10" y="10" width="44" height="44" fill="none" stroke="#1B3D2F" strokeWidth="3"/>
                        <rect x="18" y="18" width="28" height="28" fill="#1B3D2F"/>
                        <rect x="106" y="10" width="44" height="44" fill="none" stroke="#1B3D2F" strokeWidth="3"/>
                        <rect x="114" y="18" width="28" height="28" fill="#1B3D2F"/>
                        <rect x="10" y="106" width="44" height="44" fill="none" stroke="#1B3D2F" strokeWidth="3"/>
                        <rect x="18" y="114" width="28" height="28" fill="#1B3D2F"/>
                        {/* Proxy Pattern */}
                        {Array.from({ length: 48 }).map((_, i) => (
                          <rect key={i} 
                            x={60 + (i % 8) * 10} 
                            y={60 + Math.floor(i / 8) * 10} 
                            width="6" height="6" fill="#1B3D2F" opacity={((i%2)===0) ? 0.8 : 0.3} 
                          />
                        ))}
                        {/* Oasis Logo in Center */}
                        <rect x="65" y="65" width="30" height="30" fill="white" stroke="#1B3D2F" strokeWidth="0.5"/>
                        <path d="M80 72L86 78v8L80 92L74 86V78z" stroke="#1B3D2F" strokeWidth="0.5" fill="none"/>
                      </svg>
                      <div className="absolute inset-0 border border-[var(--forest)]/10 animate-soft-pulse pointer-events-none"/>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[var(--teal-pale)]/30 rounded-full">
                      <Shield size={10} className="text-[var(--forest)]"/>
                      <span className="text-[9px] uppercase tracking-[1px] text-[var(--forest)] font-bold">Secure Oasis Proxy QR</span>
                    </div>
                    <p className="text-[10px] text-[var(--grey)] font-[Jost] text-center italic">Verified and linked to seller account</p>
                  </div>
                  <div className="flex-1">
                    <div className="mb-4">
                      <p className="text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] font-[Jost] font-medium mb-1">UPI ID</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-co text-[13px] text-[var(--charcoal)]">{UPI_ID}</span>
                        <button onClick={copyUPI} className="text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors">
                          {copied ? <CheckCircle size={14} className="text-[var(--forest)]"/> : <Copy size={14}/>}
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] font-[Jost] font-medium mb-1">Payee Name</p>
                      <span className="text-[13px] text-[var(--charcoal)] font-[Jost]">{UPI_NAME}</span>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] font-[Jost] font-medium mb-1">Exact Amount</p>
                      <span className="font-display text-2xl font-light text-[var(--forest)]">₹{total.toLocaleString()}</span>
                    </div>
                    <div className="mt-5 p-3 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] flex gap-2">
                      <AlertCircle size={13} className="text-[#d4870a] shrink-0 mt-0.5"/>
                      <p className="text-[11px] text-[var(--grey)] font-[Jost] font-light leading-relaxed">
                        Pay the exact amount shown. Different amounts delay verification.
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Transaction ID / UTR Number *</label>
                    <input type="text" required className="input-underline" placeholder="12-digit UTR or transaction reference" value={txnId} onChange={e => setTxnId(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Payment Screenshot</label>
                    <label className="block border-[0.5px] border-dashed border-[var(--grey-light)] p-6 text-center cursor-pointer hover:border-[var(--forest)] transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={e => setScr(e.target.files?.[0] ?? null)}/>
                      {screenshot ? (
                        <div className="flex items-center justify-center gap-2 text-[var(--forest)]">
                          <CheckCircle size={16}/><span className="text-[12px] font-[Jost]">{screenshot.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="mx-auto mb-2 text-[var(--grey-light)]"/>
                          <p className="text-[12px] text-[var(--grey)] font-[Jost]">Upload payment screenshot</p>
                          <p className="text-[10px] text-[var(--grey-light)] mt-1">JPG or PNG — max 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  <Button type="submit" size="lg" loading={loading} className="w-full">Submit & Verify Payment</Button>
                </form>
              </div>
            )}
          </div>

          {/* Price sidebar */}
          <div className="sticky top-24">
            <div className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] p-6">
              <div className="h-[2px] bg-[var(--forest)] -mx-6 -mt-6 mb-6"/>
              <h3 className="font-display text-xl font-light text-[var(--charcoal)] mb-5">Price Breakdown</h3>
              <div className="space-y-3 mb-5 pb-5 border-b border-[var(--line)]">
                {[['Service fee', `₹${price.toLocaleString()}`], ['Platform fee (10%)', `₹${platformFee.toLocaleString()}`]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-[12px] font-[Jost]">
                    <span className="text-[var(--grey)] font-light">{l}</span>
                    <span className="text-[var(--charcoal)]">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] font-medium">Total</span>
                <span className="font-display text-2xl font-light text-[var(--forest)]">₹{total.toLocaleString()}</span>
              </div>
              <div className="mt-5 pt-5 border-t border-[var(--line)] flex items-start gap-2">
                <Shield size={13} className="text-[var(--forest)] shrink-0 mt-0.5"/>
                <p className="text-[11px] text-[var(--grey-light)] leading-relaxed font-[Jost] font-light">
                  Protected by Craftsmanship Oasis. Money released only after delivery approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PendingState({ orderId, tier, total, gigTitle }: { orderId: string; tier: string; total: number; gigTitle: string }) {
  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 border-2 border-[var(--forest)] flex items-center justify-center mx-auto mb-6">
            <Clock size={28} className="text-[var(--forest)]"/>
          </div>
          <h1 className="font-display text-4xl font-light text-[var(--charcoal)] mb-4">Payment <em className="text-[var(--forest)]">Received</em></h1>
          <p className="text-[14px] text-[var(--grey)] leading-relaxed font-[Jost] font-light mb-2">
            Our team is verifying your payment. Your project will start within <strong className="font-medium text-[var(--charcoal)]">2 hours</strong> of verification.
          </p>
          <p className="text-[12px] text-[var(--grey-light)] mb-10 font-[Jost]">You will receive an email confirmation once verified.</p>
          <div className="border-[0.5px] border-[var(--line)] p-6 text-left mb-8">
            <div className="h-[2px] bg-[#d4870a] -mx-6 -mt-6 mb-5"/>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#d4870a] animate-pulse"/>
              <span className="text-[10px] uppercase tracking-[3px] text-[#d4870a] font-medium font-[Jost]">Pending Verification</span>
            </div>
            {[
              ['Order ID', `#CO-${orderId.slice(-8).toUpperCase()}`],
              ['Package', `${tier.charAt(0).toUpperCase() + tier.slice(1)} — ${gigTitle}`],
              ['Amount', `₹${total.toLocaleString()}`],
              ['Estimated start', 'Within 2 hours'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[var(--line)] last:border-0 text-[12px] font-[Jost]">
                <span className="text-[var(--grey-light)] font-light">{k}</span>
                <span className="text-[var(--charcoal)] font-medium">{v}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/buyer"><Button size="lg" className="w-full">Go to Dashboard →</Button></Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-[11px] uppercase tracking-[3px] text-[var(--grey-light)] font-[Jost]">Loading…</div>
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  )
}
