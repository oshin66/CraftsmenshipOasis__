'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Star, Clock, RefreshCw, Check, ShieldCheck, ChevronRight, Package } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function GigPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const id = params.id
  const [gig, setGig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePkg, setActivePkg] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/gigs/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.gig) setGig(d.gig)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleOrder = async () => {
    setOrderLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId: id, package: activePkg })  // lowercase — matches Zod enum
      })
      if (res.ok) {
        const d = await res.json()
        const order = d.order
        const price = activePkg === 'basic' ? gig.basicPrice :
                      activePkg === 'standard' ? gig.standardPrice : gig.premiumPrice

        if (price === 0 && order?.deliveryFile) {
          window.location.href = order.deliveryFile
        } else {
          window.location.href = `/checkout?gigId=${id}&tier=${activePkg}&price=${price}&orderId=${order?.id || ''}`
        }
      } else {
        const d = await res.json()
        if (d.error?.includes('Unauthorized') || d.error?.includes('unauthorized')) {
          window.location.href = '/auth/login'
        } else {
          alert(d.error || 'Order failed. Please try again.')
        }
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
      <RefreshCw size={24} className="animate-spin text-[var(--forest)]"/>
    </div>
  )

  if (!gig) return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-8 py-32 text-center pt-48">
        <h1 className="font-display text-4xl font-light text-[var(--charcoal)]">Gig Not Found</h1>
        <Link href="/browse" className="inline-block mt-8 text-[var(--forest)] underline">← Back to Browse</Link>
      </div>
    </div>
  )

  const packages = {
    basic:    { label: 'Basic',    price: gig.basicPrice,    desc: gig.basicDesc    || 'Core architecture and basic functionality setup.', deadline: gig.deliveryDays, items: ['Source Code', 'Setup Guide'] },
    standard: { label: 'Standard', price: gig.standardPrice, desc: gig.standardDesc || 'Full application development with API integration.', deadline: gig.deliveryDays + 3, items: ['Source Code', 'Setup Guide', '1 Revision', 'Technical Doc'] },
    premium:  { label: 'Premium',  price: gig.premiumPrice,  desc: gig.premiumDesc  || 'Enterprise-ready solution with deployment and support.', deadline: gig.deliveryDays + 7, items: ['Source Code', 'Setup Guide', 'Priority Support', '3 Revisions', 'Deployment Help'] },
  }

  const pkg = packages[activePkg]

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar/>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12 pt-28">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] font-medium mb-8 font-[Jost]">
          <Link href="/browse" className="hover:text-[var(--forest)] transition-colors">Marketplace</Link>
          <ChevronRight size={10}/>
          <span className="text-[var(--forest)]">{gig.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <h1 className="font-display text-[42px] font-light leading-[1.1] text-[var(--charcoal)] mb-6">{gig.title}</h1>
            
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-[var(--line)]">
              <div className="w-12 h-12 bg-[var(--forest)] flex items-center justify-center text-[var(--paper)] font-display text-lg">
                {gig.seller?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[var(--charcoal)] font-[Jost]">{gig.seller?.name || 'Seller'}</span>
                  <Badge variant="teal" size="sm">Pro Seller</Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1 text-[12px] text-[#d4870a]"><Star size={12} fill="currentColor"/> <span>{gig.rating || 0}</span> <span className="text-[var(--grey-light)]">({gig.totalOrders || 0} orders)</span></div>
                </div>
              </div>
            </div>

            <div className="aspect-video bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] mb-12 flex items-center justify-center relative overflow-hidden group">
              {gig.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={gig.thumbnail} 
                  alt={gig.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <Package size={60} className="opacity-10 group-hover:scale-110 transition-transform duration-700 text-[var(--forest)]"/>
              )}
            </div>

            {gig.demoUrl && (
              <div className="mb-12 animate-fade-in">
                <h3 className="text-[11px] uppercase tracking-[3px] text-[var(--forest)] font-bold mb-6">Demo / Preview</h3>
                <div className="bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] overflow-hidden max-w-md mx-auto md:mx-0 rounded-2xl shadow-sm">
                  {gig.demoUrl.startsWith('data:image/') ? (
                    <img src={gig.demoUrl} alt="Gig Demo" className="w-full h-auto rounded-2xl" />
                  ) : gig.demoUrl.startsWith('data:video/') ? (
                    <video src={gig.demoUrl} controls className="w-full h-auto rounded-2xl shadow-inner bg-black/5" />
                  ) : (gig.demoUrl.includes('youtube.com') || gig.demoUrl.includes('youtu.be')) ? (
                    <div className="aspect-video rounded-2xl overflow-hidden">
                      <iframe 
                        className="w-full h-full"
                        src={gig.demoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="p-8 flex items-center justify-between gap-6">
                      <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light">
                        A demo file has been provided for this gig.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => {
                        if (gig.demoUrl.startsWith('data:')) {
                           const link = document.createElement('a')
                           link.href = gig.demoUrl
                           link.download = `demo-${gig.id.slice(-6)}`
                           link.click()
                        } else {
                           window.open(gig.demoUrl, '_blank')
                        }
                      }}>
                        View / Download Demo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-[11px] uppercase tracking-[3px] text-[var(--forest)] font-bold mb-6">About this Gig</h2>
              <div className="text-[15px] leading-[1.8] text-[var(--grey)] font-[Jost] font-light space-y-4 whitespace-pre-wrap">
                {gig.description}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-[11px] uppercase tracking-[3px] text-[var(--forest)] font-bold mb-6">Technologies Used</h2>
              <div className="flex flex-wrap gap-2">
                {gig.techStack.split(',').map((tech: string) => (
                  <div key={tech} className="px-4 py-2 bg-[var(--paper-dark)] border border-[var(--line)] text-[12px] text-[var(--charcoal)] font-[Jost]">
                    {tech.trim()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="border-[0.5px] border-[var(--line)] bg-[var(--paper)]">
                <div className="flex bg-[var(--paper-dark)] border-b border-[var(--line)]">
                  {(['basic', 'standard', 'premium'] as const).map((k) => (
                    <button key={k} onClick={() => setActivePkg(k)}
                      className={`flex-1 py-4 text-[10px] uppercase tracking-[2px] font-medium transition-colors
                        ${activePkg === k ? 'bg-[var(--paper)] text-[var(--forest)] border-b-2 border-[var(--forest)]' : 'text-[var(--grey-light)] hover:text-[var(--grey)]'}`}>
                      {k}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-2xl font-light text-[var(--charcoal)] capitalize">{activePkg} Package</h3>
                    <div className="text-[22px] font-display font-light text-[var(--forest)]">₹{pkg.price.toLocaleString()}</div>
                  </div>
                  <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light mb-8 leading-relaxed">{pkg.desc}</p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-[12px] text-[var(--charcoal)] font-[Jost]"><Clock size={14} className="text-[var(--grey-light)]"/> <span>{pkg.deadline} Days Delivery</span></div>
                    {pkg.items.map(item => (
                      <div key={item} className="flex items-center gap-3 text-[12px] text-[var(--grey)] font-[Jost] font-light"><Check size={14} className="text-[var(--forest)]"/> <span>{item}</span></div>
                    ))}
                  </div>
                  <Button size="lg" className="w-full" onClick={handleOrder} loading={orderLoading}>Continue (₹{pkg.price.toLocaleString()})</Button>
                </div>
              </div>

              <div className="p-6 bg-[var(--forest)]/5 border border-[var(--forest)]/10">
                <div className="flex items-start gap-4">
                  <ShieldCheck size={20} className="text-[var(--forest)] shrink-0"/>
                  <div>
                    <h4 className="text-[12px] font-bold text-[var(--forest)] uppercase tracking-wide mb-1">Oasis Protection</h4>
                    <p className="text-[11px] text-[var(--grey)] font-[Jost] leading-relaxed">Payment is held securely and only released when you approve the work.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
