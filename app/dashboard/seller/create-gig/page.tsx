'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/lib/useAuth'
import { toBase64 } from '@/lib/fileUtils'

const CATEGORIES = ['AI & ML', 'Web Dev', 'App Dev', 'Data Science', 'Scripting', 'CS Projects']
const TECH_OPTIONS = ['Python','JavaScript','TypeScript','React','Next.js','Django','FastAPI','Node.js','Java','LangChain','PyTorch','TensorFlow','Flutter','Firebase','PostgreSQL','MongoDB']

type Step = 1 | 2 | 3

interface GigForm {
  title: string; description: string; category: string; techStack: string[]
  basicPrice: string; basicDesc: string
  standardPrice: string; standardDesc: string
  premiumPrice: string; premiumDesc: string
  deliveryDays: string; thumbnail: File | null
  demo: File | null;
  demoLink: string;
  freeDownloadUrl: string;
}

const INIT: GigForm = {
  title: '', description: '', category: '', techStack: [],
  basicPrice: '', basicDesc: '',
  standardPrice: '', standardDesc: '',
  premiumPrice: '', premiumDesc: '',
  deliveryDays: '7', thumbnail: null,
  demo: null,
  demoLink: '',
  freeDownloadUrl: '',
}

export default function CreateGigPage() {
  const { user, loading: authLoading } = useAuth('SELLER')
  const router = useRouter()
  const [step, setStep]             = useState<Step>(1)
  const [form, setForm]             = useState<GigForm>(INIT)
  const [loading, setLoading]       = useState(false)
  const [submitModal, setSubmitModal] = useState(false)

  const set = (key: keyof GigForm, val: any) => setForm(f => ({ ...f, [key]: val }))

  const toggleTech = (tech: string) => {
    set('techStack', form.techStack.includes(tech)
      ? form.techStack.filter(t => t !== tech)
      : [...form.techStack, tech])
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      let thumbnailBase64 = null
      let demoBase64 = null
      
      if (form.thumbnail) thumbnailBase64 = await toBase64(form.thumbnail)
      if (form.demo) {
        if (form.demo.size > 14 * 1024 * 1024) {
          alert("Demo file is too large (>14MB). Please provide a link instead.")
          setLoading(false)
          return
        }
        demoBase64 = await toBase64(form.demo)
      }

      const { demo, demoLink, thumbnail, ...restForm } = form;
      
      const payload = {
        ...restForm,
        basicPrice: Number(form.basicPrice),
        standardPrice: Number(form.standardPrice),
        premiumPrice: Number(form.premiumPrice),
        deliveryDays: Number(form.deliveryDays),
        techStack: form.techStack.join(','),
        thumbnail: thumbnailBase64,
        demoUrl: demoBase64 || form.demoLink,
        freeDownloadUrl: form.freeDownloadUrl
      }
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setSubmitModal(true)
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to create gig')
      }
    } catch {
      alert('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] font-medium font-[Jost] mb-1">Seller</p>
          <h1 className="font-display text-4xl font-light text-[var(--charcoal)]">Create a <em>New Gig</em></h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10 pb-8 border-b border-[var(--line)]">
          {[
            { num: 1, label: 'Overview'  },
            { num: 2, label: 'Pricing'   },
            { num: 3, label: 'Publish'   },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button onClick={() => step > s.num && setStep(s.num as Step)} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 flex items-center justify-center text-[11px] font-medium font-[Jost] border transition-colors
                  ${step === s.num ? 'bg-[var(--forest)] border-[var(--forest)] text-[var(--paper)]'
                    : step > s.num ? 'bg-[var(--teal-pale)] border-[var(--forest)]/30 text-[var(--forest)]'
                    : 'border-[var(--grey-light)] text-[var(--grey-light)]'}`}>
                  {step > s.num ? <CheckCircle size={14}/> : s.num}
                </div>
                <span className={`text-[9px] uppercase tracking-[1.5px] font-[Jost] font-medium
                  ${step===s.num?'text-[var(--forest)]':'text-[var(--grey-light)]'}`}>{s.label}</span>
              </button>
              {i < 2 && <div className={`w-24 h-[0.5px] mb-4 mx-2 ${step > s.num ? 'bg-[var(--forest)]' : 'bg-[var(--line)]'}`}/>}
            </div>
          ))}
        </div>

        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-8 animate-rise">
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Gig Title *</label>
              <input className="input-underline" placeholder="I will build a RAG chatbot using LangChain and FastAPI..."
                value={form.title} onChange={e => set('title', e.target.value)}/>
              <p className="text-[10px] text-[var(--grey-light)] mt-1 font-[Jost]">{form.title.length}/80 characters</p>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => set('category', cat)}
                    className={`py-2.5 px-3 text-[11px] font-[Jost] border-[0.5px] transition-colors text-left
                      ${form.category===cat ? 'bg-[var(--forest)] border-[var(--forest)] text-[var(--paper)]' : 'border-[var(--line)] text-[var(--grey)] hover:border-[var(--forest)] hover:text-[var(--forest)]'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Tech Stack *</label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map(tech => (
                  <button key={tech} onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5 text-[10px] font-mono-co border-[0.5px] transition-colors
                      ${form.techStack.includes(tech) ? 'bg-[var(--forest)] border-[var(--forest)] text-[var(--paper)]' : 'border-[var(--line)] text-[var(--grey)] hover:border-[var(--forest)]'}`}>
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Description *</label>
              <textarea rows={6} className="input-underline resize-none"
                placeholder="Describe what you offer, your experience, what makes you the best choice for this project..."
                value={form.description} onChange={e => set('description', e.target.value)}/>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Thumbnail Image *</label>
                <label className="block border-[0.5px] border-dashed border-[var(--grey-light)] p-8 text-center cursor-pointer hover:border-[var(--forest)] transition-colors h-40 flex flex-col items-center justify-center">
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0] ?? null
                    if (file && file.size > 2 * 1024 * 1024) {
                      alert("Thumbnail must be smaller than 2MB. Please compress your image.")
                      e.target.value = ''
                      return
                    }
                    set('thumbnail', file)
                  }}/>
                  {form.thumbnail ? (
                    <div className="flex flex-col items-center gap-2 text-[var(--forest)]">
                      <CheckCircle size={24}/><span className="text-[10px] font-[Jost] truncate max-w-[150px]">{form.thumbnail.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="mx-auto mb-2 text-[var(--grey-light)]"/>
                      <p className="text-[11px] text-[var(--grey)] font-[Jost]">Cover Image</p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Demo (File or Link)</label>
                <div className="space-y-4">
                  <label className="block border-[0.5px] border-dashed border-[var(--grey-light)] p-2 text-center cursor-pointer hover:border-[var(--forest)] transition-colors h-24 flex flex-col items-center justify-center">
                    <input type="file" className="hidden" onChange={e => {
                      const file = e.target.files?.[0] ?? null
                      if (file && file.size > 5 * 1024 * 1024) {
                        alert("Demo file must be smaller than 5MB. Please upload to YouTube/Loom and provide a link instead.")
                        e.target.value = ''
                        return
                      }
                      set('demo', file)
                    }}/>
                    {form.demo ? (
                      <div className="flex flex-col items-center gap-1 text-[var(--forest)]">
                        <CheckCircle size={16}/><span className="text-[10px] font-[Jost] truncate max-w-[150px]">{form.demo.name}</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); set('demo', null) }} className="text-[8px] underline opacity-50">Remove</button>
                      </div>
                    ) : (
                      <>
                        <Upload size={16} className="mx-auto mb-1 text-[var(--grey-light)]"/>
                        <p className="text-[10px] text-[var(--grey)] font-[Jost]">Upload Demo (Max 4MB)</p>
                      </>
                    )}
                  </label>
                  <div className="relative">
                    <input className="input-underline !py-2 !text-[12px]" placeholder="...or enter YouTube/Loom/Live Link"
                      value={form.demoLink} onChange={e => set('demoLink', e.target.value)} disabled={!!form.demo}/>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button size="lg" onClick={() => setStep(2)}
                disabled={!form.title || !form.category || form.techStack.length === 0 || !form.description}>
                Next: Pricing <ChevronRight size={13}/>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Pricing */}
        {step === 2 && (
          <div className="animate-rise">
            <div className="grid grid-cols-3 gap-[1px] bg-[var(--line)] border-[0.5px] border-[var(--line)] mb-8">
              {[
                { key: 'basic' as const,    label: 'Basic',    priceKey: 'basicPrice' as const,    descKey: 'basicDesc' as const    },
                { key: 'standard' as const, label: 'Standard', priceKey: 'standardPrice' as const, descKey: 'standardDesc' as const },
                { key: 'premium' as const,  label: 'Premium',  priceKey: 'premiumPrice' as const,  descKey: 'premiumDesc' as const  },
              ].map((tier, i) => (
                <div key={tier.key} className={`bg-[var(--paper)] p-6 ${i===1?'bg-[var(--paper-dark)]':''}`}>
                  {i===1 && <div className="h-[2px] bg-[var(--forest)] -mx-6 -mt-6 mb-5"/>}
                  <p className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] font-medium font-[Jost] mb-4">{tier.label}</p>
                  <div className="mb-4">
                    <label className="text-[8px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] font-medium mb-1 block">Price (₹)</label>
                    <input type="number" className="input-underline font-display text-xl" placeholder="3500"
                      value={form[tier.priceKey]} onChange={e => set(tier.priceKey, e.target.value)}/>
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] font-medium mb-1 block">What's Included</label>
                    <textarea rows={4} className="input-underline resize-none text-[13px]"
                      placeholder="List what's included in this package..."
                      value={form[tier.descKey]} onChange={e => set(tier.descKey, e.target.value)}/>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8 max-w-xs">
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Delivery Time (days)</label>
              <select className="input-underline" value={form.deliveryDays} onChange={e => set('deliveryDays', e.target.value)}>
                {[1,2,3,5,7,10,14,21,30].map(d => <option key={d} value={d}>{d} {d===1?'day':'days'}</option>)}
              </select>
            </div>

            {Number(form.basicPrice) === 0 && (
              <div className="mb-8 p-6 bg-[var(--forest)]/5 border border-[var(--forest)]/10 animate-fade-in">
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--forest)] mb-2 font-[Jost] font-medium">Free Download URL (Direct ZIP Link) *</label>
                <input className="input-underline" placeholder="https://github.com/user/repo/archive/refs/heads/main.zip"
                  value={form.freeDownloadUrl} onChange={e => set('freeDownloadUrl', e.target.value)}/>
                <p className="text-[10px] text-[var(--grey)] mt-2 font-[Jost] font-light">
                  Required for free gigs. Users will be redirected here immediately after clicking "Buy".
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="md" onClick={() => setStep(1)}>← Back</Button>
              <Button size="lg" onClick={() => setStep(3)}
                disabled={!form.basicPrice || !form.standardPrice || !form.premiumPrice}>
                Review & Publish <ChevronRight size={13}/>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Publish */}
        {step === 3 && (
          <div className="animate-rise space-y-6">
            {/* Preview card */}
            <div className="border-[0.5px] border-[var(--line)] p-6">
              <div className="h-[2px] bg-[var(--forest)] -mx-6 -mt-6 mb-5"/>
              <div className="flex items-start gap-3 mb-4">
                {form.category && <span className="text-[9px] px-2 py-0.5 border border-[var(--forest)] text-[var(--forest)] uppercase tracking-wider font-[Jost]">{form.category}</span>}
              </div>
              <h2 className="font-display text-2xl font-light text-[var(--charcoal)] mb-3">
                {form.title || 'Your Gig Title'}
              </h2>
              <p className="text-[13px] text-[var(--grey)] leading-relaxed font-[Jost] font-light mb-4 line-clamp-3">
                {form.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.techStack.map(t => <span key={t} className="text-[9px] px-2 py-0.5 bg-[var(--paper-dark)] text-[var(--grey)] font-mono-co">{t}</span>)}
              </div>
              <div className="flex gap-6 pt-4 border-t border-[var(--line)]">
                {[
                  { label: 'Basic', price: form.basicPrice },
                  { label: 'Standard', price: form.standardPrice },
                  { label: 'Premium', price: form.premiumPrice },
                ].map(tier => (
                  <div key={tier.label}>
                    <p className="text-[9px] uppercase tracking-wider text-[var(--grey-light)] font-[Jost]">{tier.label}</p>
                    <p className="font-display text-xl font-light text-[var(--forest)]">₹{Number(tier.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission info box */}
            <div className="flex items-start gap-3 p-5 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)]">
              <AlertCircle size={16} className="text-[#d4870a] shrink-0 mt-0.5"/>
              <div>
                <p className="text-[12px] font-medium text-[var(--charcoal)] font-[Jost] mb-1">Your gig will be reviewed before going live.</p>
                <p className="text-[12px] text-[var(--grey)] font-[Jost] font-light leading-relaxed">
                  Our team reviews every gig for quality, accuracy, and compliance. Most gigs are approved within <strong className="font-medium">4–6 hours</strong>. You'll receive an email once it's live.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="md" onClick={() => setStep(2)}>← Back</Button>
              <div className="flex gap-3">
                <Button variant="ghost" size="md">Save as Draft</Button>
                <Button size="lg" loading={loading} onClick={handlePublish}>
                  Submit for Review →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification alert modal */}
      <Modal isOpen={submitModal} onClose={() => { setSubmitModal(false); router.push('/dashboard/seller') }} title="" size="sm">
        <div className="text-center py-4">
          <div className="w-14 h-14 border-2 border-[var(--forest)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={24} className="text-[var(--forest)]"/>
          </div>
          <h2 className="font-display text-2xl font-light text-[var(--charcoal)] mb-3">Gig Submitted!</h2>
          <p className="text-[13px] text-[var(--grey)] leading-relaxed font-[Jost] font-light mb-6">
            Your gig has been sent for verification. It will be published within <strong className="font-medium text-[var(--charcoal)]">4–6 hours</strong> after our team reviews it.
          </p>
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-2 h-2 rounded-full bg-[#d4870a] animate-pulse"/>
            <span className="text-[10px] uppercase tracking-[2px] text-[#d4870a] font-medium font-[Jost]">Pending Approval</span>
          </div>
          <Button size="md" className="w-full" onClick={() => { setSubmitModal(false); router.push('/dashboard/seller') }}>
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </div>
  )
}
