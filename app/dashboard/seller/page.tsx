'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TrendingUp, Package, Plus, Upload, CheckCircle, Eye, RefreshCw, Trash2, AlertCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import OrderProgress from '@/components/order/OrderProgress'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/lib/useAuth'

const GIG_STATUS_BADGE: Record<string, { label: string; variant: 'forest' | 'teal' | 'grey' | 'warning' | 'danger' }> = {
  PUBLISHED:      { label: 'Live',           variant: 'forest'  },
  PENDING_REVIEW: { label: 'Under Review',   variant: 'warning' },
  DRAFT:          { label: 'Draft',          variant: 'grey'    },
  REJECTED:       { label: 'Rejected',       variant: 'danger'  },
}

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth('SELLER')
  const [activeTab, setActiveTab]     = useState<'orders' | 'gigs' | 'history'>('orders')
  const [gigs, setGigs]               = useState<any[]>([])
  const [orders, setOrders]           = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [deliverModal, setDeliverModal] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const fetchAll = useCallback(async (userId: string) => {
    setDataLoading(true)
    try {
      const [gr, or] = await Promise.all([
        fetch(`/api/gigs?sellerId=${userId}`),
        fetch(`/api/orders?view=seller`),
      ])
      if (gr.ok) { const d = await gr.json(); setGigs(d.gigs || d.data?.gigs || []) }
      if (or.ok) { const d = await or.json(); setOrders(d.orders || d.data?.orders || []) }
    } catch {
      setToast({ msg: 'Failed to sync data', type: 'error' })
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchAll(user.userId)
  }, [user, fetchAll])

  const handleDeliver = async (orderId: string, deliveryUrl: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deliver', deliveryFile: deliveryUrl })
      })
      if (res.ok) {
        setToast({ msg: 'Work delivered! Awaiting buyer review.', type: 'success' })
        if (user) fetchAll(user.userId)
      } else {
        const d = await res.json()
        setToast({ msg: d.error || 'Delivery failed', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Network error', type: 'error' })
    }
  }

  const handleDeleteGig = async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/gigs/${deleteConfirm}`, { method: 'DELETE' })
      if (res.ok) {
        setToast({ msg: 'Gig deleted successfully', type: 'success' })
        if (user) fetchAll(user.userId)
      } else {
        const d = await res.json()
        setToast({ msg: d.error || 'Failed to delete gig', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Network error. Please try again.', type: 'error' })
    } finally {
      setDeleteLoading(false)
      setDeleteConfirm(null)
    }
  }

  if (authLoading) return null

  const totalEarnings = orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.price, 0)
  const activeProjects = orders.filter(o => 
    !['COMPLETED','CANCELLED','PENDING_PAYMENT','PAYMENT_VERIFICATION'].includes(o.status) 
    && o.gig.status !== 'ARCHIVED'
  )

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="max-w-6xl mx-auto px-8 py-12 pt-24">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] font-medium font-[Jost] mb-1">Seller Dashboard</p>
            <h1 className="font-display text-4xl font-light text-[var(--charcoal)]">
              Hello, <em>{user?.name || user?.email?.split('@')[0]}.</em>
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => user && fetchAll(user.userId)} className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] mb-2 hover:text-[var(--forest)]">
              <RefreshCw size={14} className={dataLoading ? 'animate-spin' : ''}/>
            </button>
            <Link href="/dashboard/seller/create-gig">
              <Button size="md"><Plus size={13}/> Create New Gig</Button>
            </Link>
          </div>
        </div>

        {/* Earnings + stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--line)] border-[0.5px] border-[var(--line)] mb-10">
          {[
            { num: `₹${(totalEarnings * 0.9).toLocaleString()}`, label: 'Net Earnings', sub: 'After platform fee', icon: <TrendingUp size={14}/> },
            { num: activeProjects.length, label: 'Active Projects', sub: 'In progress', icon: <Package size={14}/> },
            { num: gigs.filter(g=>g.status==='PUBLISHED').length, label: 'Live Gigs', sub: 'Published', icon: <Eye size={14}/> },
            { num: '0 ★', label: 'Average Rating', sub: `${gigs.reduce((s,g)=>s+(g.totalOrders||0),0)} total orders`, icon: <CheckCircle size={14}/> },
          ].map(({ num, label, sub, icon }) => (
            <div key={label} className="bg-[var(--paper)] p-6">
              <div className="flex items-center gap-2 text-[var(--grey-light)] mb-2">
                {icon}<span className="text-[9px] uppercase tracking-[2px] font-[Jost] font-medium">{label}</span>
              </div>
              <div className="font-display text-3xl font-light text-[var(--charcoal)]">{num}</div>
              <div className="text-[10px] text-[var(--grey-light)] mt-1 font-[Jost]">{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--line)] mb-8">
          {[
            { key: 'orders',  label: `Active Orders (${activeProjects.length})` },
            { key: 'history', label: `History` },
            { key: 'gigs',    label: `My Gigs (${gigs.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 text-[11px] uppercase tracking-[2px] font-medium font-[Jost] border-b-2 transition-colors
                ${activeTab===tab.key ? 'border-[var(--forest)] text-[var(--forest)]' : 'border-transparent text-[var(--grey-light)] hover:text-[var(--grey)]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="text-center py-20">
            <RefreshCw size={24} className="mx-auto animate-spin text-[var(--grey-light)]"/>
          </div>
        ) : (
          <>
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-slide-up">
                {activeProjects.length === 0 ? (
                  <div className="text-center py-20 border-[0.5px] border-dashed border-[var(--line)]">
                    <p className="font-[Jost] text-[13px] text-[var(--grey-light)]">No active orders yet. Gigs go live after admin approval.</p>
                  </div>
                ) : activeProjects.map(order => (
                  <div key={order.id} className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] hover:border-[var(--forest)]/30 transition-colors">
                    <div className="h-[2px] bg-[var(--teal)]"/>
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                        <div>
                          <h3 className="text-[15px] font-medium text-[var(--charcoal)] font-[Jost] mb-1">{order.gig.title}</h3>
                          <p className="text-[12px] text-[var(--grey)] font-[Jost] font-light">
                            {order.package} · Buyer: {order.buyer.name} · ₹{order.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost]">Deadline</p>
                          <p className="text-[13px] font-medium text-[var(--charcoal)] font-[Jost]">
                            {order.deadline ? new Date(order.deadline).toLocaleDateString('en-IN') : 'TBD'}
                          </p>
                          <p className="font-display text-xl font-light text-[var(--forest)] mt-1">
                            ₹{Math.round(order.price * 0.9).toLocaleString()}
                            <span className="text-[10px] text-[var(--grey-light)] ml-1 font-[Jost]">net</span>
                          </p>
                        </div>
                      </div>

                      {order.requirements && (
                        <div className="mb-5">
                           <p className="text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] font-medium mb-2">Requirements</p>
                           <div className="p-4 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] text-[12px] text-[var(--charcoal)] font-[Jost] font-light whitespace-pre-wrap">
                             {order.requirements}
                           </div>
                        </div>
                      )}

                      {order.status === 'REQUIREMENTS_PENDING' && (
                        <div className="p-4 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] mb-5 text-[12px] text-[var(--grey)] font-[Jost] font-light">
                          ⏳ Waiting for buyer to submit project requirements.
                        </div>
                      )}

                      {!['REQUIREMENTS_PENDING'].includes(order.status) && (
                        <div className="mb-5"><OrderProgress status={order.status}/></div>
                      )}

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--line)]">
                        {order.status === 'IN_PROGRESS' && (
                          <Button size="sm" onClick={() => setDeliverModal(order.id)}>
                            <Upload size={12}/> Deliver Work
                          </Button>
                        )}
                          <Button variant="outline" size="sm" onClick={() => {
                            window.location.href = `mailto:${order.buyer.email}?subject=${encodeURIComponent(`Order Update: ${order.gig.title}`)}`
                          }}>Message Buyer</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-slide-up">
                {orders.filter(o => ['COMPLETED','CANCELLED','DELIVERED'].includes(o.status)).length === 0 ? (
                  <div className="text-center py-20 border-[0.5px] border-dashed border-[var(--line)]">
                    <p className="font-[Jost] text-[13px] text-[var(--grey-light)]">No completed orders yet.</p>
                  </div>
                ) : orders.filter(o => ['COMPLETED','CANCELLED','DELIVERED'].includes(o.status)).map(order => (
                  <div key={order.id} className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <Badge variant={order.status === 'COMPLETED' ? 'grey' : 'danger'} size="sm">{order.status}</Badge>
                           <span className="text-[10px] text-[var(--grey-light)] font-[Jost]">Order #CO-{order.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <h3 className="text-[14px] font-medium text-[var(--charcoal)] font-[Jost] mb-1">{order.gig.title}</h3>
                        <p className="text-[11px] text-[var(--grey)] font-[Jost]">Buyer: {order.buyer.name} · Completed on {new Date(order.updatedAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-light text-[var(--forest)]">₹{Math.round(order.price * 0.9).toLocaleString()}</p>
                        <p className="text-[9px] uppercase tracking-[1px] text-[var(--grey-light)] font-[Jost]">Earned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GIGS TAB */}
            {activeTab === 'gigs' && (
              <div className="space-y-4 animate-slide-up">
                {gigs.map(gig => {
                  const badge = GIG_STATUS_BADGE[gig.status]
                  return (
                    <div key={gig.id} className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] hover:border-[var(--forest)]/30 transition-colors p-5 flex items-center gap-5">
                      <div className="w-16 h-16 bg-[var(--paper-dark)] flex items-center justify-center shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-20"><path d="M12 2L22 7v10L12 22 2 17V7z" stroke="#1B3D2F" strokeWidth="1"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {badge && <Badge variant={badge.variant} size="sm">{badge.label}</Badge>}
                          <Badge variant="grey" size="sm">{gig.category}</Badge>
                        </div>
                        <h3 className="text-[14px] font-medium text-[var(--charcoal)] font-[Jost] truncate">{gig.title}</h3>
                        <p className="text-[11px] text-[var(--grey)] mt-1 font-[Jost]">
                          From ₹{gig.basicPrice.toLocaleString()} · {gig.totalOrders} orders · {gig.rating > 0 ? `${gig.rating}★` : 'No reviews yet'}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/gig/${gig.id}`}><Button variant="ghost" size="sm"><Eye size={12}/></Button></Link>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(gig.id)} className="text-[var(--danger)] hover:bg-[var(--danger)]/10">
                          <Trash2 size={12}/>
                        </Button>
                      </div>
                    </div>
                  )
                })}
                <Link href="/dashboard/seller/create-gig">
                  <div className="border-[0.5px] border-dashed border-[var(--grey-light)] p-8 text-center cursor-pointer hover:border-[var(--forest)] transition-colors group">
                    <Plus size={20} className="mx-auto mb-2 text-[var(--grey-light)] group-hover:text-[var(--forest)] transition-colors"/>
                    <p className="text-[12px] text-[var(--grey)] font-[Jost]">Add a new gig</p>
                  </div>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Deliver Work Modal */}
      <Modal isOpen={!!deliverModal} onClose={() => setDeliverModal(null)} title="Deliver Your Work" size="md">
        <DeliverForm onSubmit={(url) => { 
          if (deliverModal) handleDeliver(deliverModal, url)
          setDeliverModal(null) 
        }}/>
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteConfirm}
        title="Delete Gig?"
        message="Are you sure you want to delete this gig? This action cannot be undone."
        confirmLabel="Delete Forever"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteGig}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}

function DeliverForm({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [file, setFile]       = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // In a real app, we'd upload the file and get a URL.
    // Here we'll just mock it with the filename.
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onSubmit(file ? `https://storage.co.in/deliveries/${file.name}` : 'https://storage.co.in/deliveries/project.zip')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Delivery Message</label>
        <textarea rows={3} required className="input-underline resize-none"
          placeholder="Describe what you've delivered, how to run the code..."
          value={message} onChange={e => setMessage(e.target.value)}/>
      </div>
      <div>
        <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Attach Delivery File *</label>
        <label className="block border-[0.5px] border-dashed border-[var(--grey-light)] p-6 text-center cursor-pointer hover:border-[var(--forest)] transition-colors">
          <input type="file" className="hidden" required accept=".zip,.pdf,.py,.js,.ts" onChange={e => setFile(e.target.files?.[0] ?? null)}/>
          {file ? (
            <div className="flex items-center justify-center gap-2 text-[var(--forest)]">
              <CheckCircle size={16}/><span className="text-[12px] font-[Jost]">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload size={20} className="mx-auto mb-2 text-[var(--grey-light)]"/>
              <p className="text-[12px] text-[var(--grey)] font-[Jost]">Upload your delivery (ZIP recommended)</p>
              <p className="text-[10px] text-[var(--grey-light)] mt-1">Max 100MB</p>
            </>
          )}
        </label>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        <Upload size={13}/> Submit Delivery
      </Button>
    </form>
  )
}
