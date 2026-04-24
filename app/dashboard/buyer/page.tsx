'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Package, Clock, CheckCircle, AlertCircle, Star, RefreshCw, Send, FileText } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import OrderProgress from '@/components/order/OrderProgress'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import { useAuth } from '@/lib/useAuth'

const STATUS_BADGE: Record<string, { label: string; variant: 'forest' | 'teal' | 'grey' | 'warning' | 'danger' }> = {
  PENDING_PAYMENT:      { label: 'Awaiting Payment',   variant: 'warning' },
  PAYMENT_VERIFICATION: { label: 'Verifying Payment',  variant: 'warning' },
  REQUIREMENTS_PENDING: { label: 'Needs Requirements', variant: 'warning' },
  IN_PROGRESS:          { label: 'In Progress',        variant: 'teal'    },
  IN_REVIEW:            { label: 'In Review',          variant: 'teal'    },
  DELIVERED:            { label: 'Delivered',          variant: 'forest'  },
  COMPLETED:            { label: 'Completed',          variant: 'grey'    },
  CANCELLED:            { label: 'Cancelled',          variant: 'danger'  },
}

export default function BuyerDashboard() {
  const { user, loading: authLoading } = useAuth('BUYER')
  const [activeTab, setActiveTab]     = useState<'active' | 'completed'>('active')
  const [orders, setOrders]           = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<any | null>(null)
  const [reqModal, setReqModal]       = useState<string | null>(null)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setDataLoading(true)
    try {
      const res = await fetch('/api/orders?view=buyer')
      if (res.ok) {
        const d = await res.json()
        setOrders(d.orders ?? [])
      }
    } catch {
      setToast({ msg: 'Failed to sync orders', type: 'error' })
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchOrders()
  }, [user, fetchOrders])

  const handleAction = async (orderId: string, action: string, data: any = {}) => {
    setActionLoading(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })
      if (res.ok) {
        setToast({ msg: `Action successful: ${action.replace('_', ' ')}`, type: 'success' })
        fetchOrders()
      } else {
        const d = await res.json()
        setToast({ msg: d.error || 'Action failed', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Network error', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading) return null

  const active    = orders.filter(o => !['COMPLETED','CANCELLED'].includes(o.status))
  const completed = orders.filter(o =>  ['COMPLETED','CANCELLED'].includes(o.status))
  const displayed = activeTab === 'active' ? active : completed

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="max-w-6xl mx-auto px-8 py-12 pt-24">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] font-medium font-[Jost] mb-1">Buyer Dashboard</p>
            <h1 className="font-display text-4xl font-light text-[var(--charcoal)]">
              Hello, <em>{user?.name?.split(' ')[0] || user?.email?.split('@')[0]}.</em>
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchOrders} className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] mb-2 hover:text-[var(--forest)]">
              <RefreshCw size={14} className={dataLoading ? 'animate-spin' : ''}/>
            </button>
            <Link href="/browse"><Button size="md">+ New Order</Button></Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--line)] mb-10 border-[0.5px] border-[var(--line)]">
          {[
            { num: active.length,    label: 'Active Orders', icon: <Clock size={14}/> },
            { num: completed.filter(o=>o.status==='COMPLETED').length, label: 'Completed', icon: <CheckCircle size={14}/> },
            { num: active.filter(o=>o.status==='IN_REVIEW').length, label: 'In Review', icon: <Package size={14}/> },
            { num: `₹${orders.reduce((s,o)=>s+o.price,0).toLocaleString()}`, label: 'Total Invested', icon: <Star size={14}/> },
          ].map(({ num, label, icon }) => (
            <div key={label} className="bg-[var(--paper)] p-6">
              <div className="flex items-center gap-2 text-[var(--grey-light)] mb-2">{icon}<span className="text-[9px] uppercase tracking-[2px] font-[Jost] font-medium">{label}</span></div>
              <div className="font-display text-3xl font-light text-[var(--charcoal)]">{num}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--line)] mb-8 gap-0">
          {[{ key: 'active', label: `Active (${active.length})` }, { key: 'completed', label: `Completed (${completed.length})` }].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 text-[11px] uppercase tracking-[2px] font-medium font-[Jost] border-b-2 transition-colors
                ${activeTab===tab.key ? 'border-[var(--forest)] text-[var(--forest)]' : 'border-transparent text-[var(--grey-light)] hover:text-[var(--grey)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
            <div className="text-center py-20"><RefreshCw size={24} className="mx-auto animate-spin text-[var(--grey-light)]"/></div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <Package size={32} className="mx-auto mb-4 text-[var(--grey-light)]"/>
            <p className="font-display text-2xl font-light text-[var(--grey)]">No {activeTab} orders yet</p>
            <p className="text-[13px] text-[var(--grey-light)] mt-2 font-[Jost]">Browse gigs and place your first order</p>
            <Link href="/browse" className="inline-block mt-6"><Button size="md">Browse Gigs</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(order => {
              const statusInfo = STATUS_BADGE[order.status]
              return (
                <div key={order.id} className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] hover:border-[var(--forest)]/30 transition-colors">
                  <div className="h-[2px] bg-[var(--forest)]"/>
                  <div className="p-6">
                    {/* Top row */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="grey" size="sm">{order.gig.category}</Badge>
                          <Badge variant={statusInfo?.variant ?? 'grey'} size="sm">{statusInfo?.label ?? order.status}</Badge>
                        </div>
                        <h3 className="text-[15px] font-medium text-[var(--charcoal)] font-[Jost] mt-2">{order.gig.title}</h3>
                        <p className="text-[12px] text-[var(--grey)] mt-1 font-[Jost] font-light">
                          {order.package} Package · by {order.seller.name} · ₹{order.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost]">Order ID</p>
                        <p className="font-mono-co text-[12px] text-[var(--charcoal)]">#CO-{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-[var(--grey-light)] mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Special state: Payment verification */}
                    {order.status === 'PAYMENT_VERIFICATION' && (
                      <div className="flex items-start gap-3 p-4 bg-[#d4870a]/8 border-[0.5px] border-[#d4870a]/30 mb-5">
                        <AlertCircle size={15} className="text-[#d4870a] shrink-0 mt-0.5"/>
                        <div>
                          <p className="text-[12px] font-medium text-[#d4870a] font-[Jost]">Our team is verifying your payment.</p>
                          <p className="text-[11px] text-[var(--grey)] mt-0.5 font-[Jost] font-light">Your project will start soon after confirmation.</p>
                        </div>
                      </div>
                    )}

                    {/* Special state: Delayed Requirements */}
                    {order.status === 'REQUIREMENTS_PENDING' && (
                      <div className="flex items-start justify-between gap-4 p-5 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] mb-5">
                        <div className="flex gap-3">
                          <FileText size={16} className="text-[var(--forest)] shrink-0 mt-0.5"/>
                          <div>
                            <p className="text-[12px] font-medium text-[var(--charcoal)] font-[Jost]">Action Required: Submit Requirements</p>
                            <p className="text-[11px] text-[var(--grey)] mt-0.5 font-[Jost] font-light">The seller needs details to start your project.</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => setReqModal(order.id)}>Submit Now</Button>
                      </div>
                    )}

                    {/* Progress tracker */}
                    {!['PENDING_PAYMENT','PAYMENT_VERIFICATION','CANCELLED'].includes(order.status) && (
                      <div className="mb-5">
                        <OrderProgress status={order.status}/>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--line)]">
                      {order.status === 'DELIVERED' && (
                        <>
                          <Button size="sm" onClick={() => handleAction(order.id, 'complete')} loading={actionLoading === order.id}>
                            <CheckCircle size={12}/> Accept Delivery
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction(order.id, 'request_revision')} loading={actionLoading === order.id}>Request Revision</Button>
                        </>
                      )}
                      {order.status === 'COMPLETED' && !order.hasReview && (
                        <Button size="sm" onClick={() => setReviewModal(order)}>Leave a Review</Button>
                      )}
                      <Button variant="ghost" size="sm">Message Seller</Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Review modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review">
        <ReviewForm 
          onSubmit={async (reviewData) => { 
            const res = await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: reviewModal.id, ...reviewData })
            })
            if (res.ok) {
              setReviewModal(null)
              setToast({ msg: 'Review submitted! Thank you.', type: 'success' })
              fetchOrders()
            } else {
              const d = await res.json()
              setToast({ msg: d.error || 'Failed to submit review', type: 'error' })
            }
          }}
        />
      </Modal>
      {/* Requirements modal */}
      <Modal isOpen={!!reqModal} onClose={() => setReqModal(null)} title="Order Requirements">
        <RequirementsForm 
          onSubmit={(reqs) => { 
            if (reqModal) handleAction(reqModal, 'submit_requirements', { requirements: reqs })
            setReqModal(null) 
          }}
          loading={actionLoading !== null}
        />
      </Modal>
    </div>
  )
}

function ReviewForm({ onSubmit }: { onSubmit: (data: { rating: number, comment: string }) => Promise<void> }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (comment.length < 5) return
    setLoading(true)
    await onSubmit({ rating, comment })
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-3 font-[Jost] font-medium">Your Rating</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)} className={`text-2xl transition-transform hover:scale-110 ${n<=rating?'text-[var(--forest)]':'text-[var(--grey-light)]'}`}>★</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Your Review</label>
        <textarea rows={4} className="input-underline resize-none" placeholder="Share your experience (min 5 chars)..."
          value={comment} onChange={e => setComment(e.target.value)}/>
      </div>
      <Button size="lg" className="w-full" loading={loading} onClick={handleSubmit} disabled={comment.length < 5}>Submit Review</Button>
    </div>
  )
}

function RequirementsForm({ onSubmit, loading }: { onSubmit: (val: string) => void, loading: boolean }) {
  const [text, setText] = useState('')
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light leading-relaxed">
        Provide instructions, technical specs, or files (via link) that the seller needs to start.
      </p>
      <textarea rows={6} required className="input-underline resize-none" 
        placeholder="Type your requirements here (min 10 chars)..."
        value={text} onChange={e => setText(e.target.value)}/>
      <Button size="lg" className="w-full" disabled={text.length < 10} loading={loading} onClick={() => onSubmit(text)}>
        <Send size={13}/> Submit & Start Project
      </Button>
    </div>
  )
}
