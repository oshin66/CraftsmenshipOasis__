'use client'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Shield, Package, TrendingUp, Users, RefreshCw } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'

type AdminTab = 'payments' | 'gigs' | 'orders' | 'users'

interface PendingPayment {
  id: string; amount: number; transactionId: string; screenshot?: string
  status: string; createdAt: string
  order: { id: string; package: string; gig: { id: string; title: string }; buyer: { id: string; name: string; email: string } }
}
interface PendingGig {
  id: string; title: string; category: string; techStack: string; description: string
  basicPrice: number; standardPrice: number; premiumPrice: number; deliveryDays: number
  status: string; createdAt: string
  seller: { id: string; name: string; email: string; sellerBio?: string }
}
interface LiveOrder {
  id: string; package: string; price: number; status: string; createdAt: string
  gig: { id: string; title: string }
  buyer: { id: string; name: string }
  seller: { id: string; name: string }
}
interface LiveUser {
  id: string; name: string; email: string; role: string; isSeller: boolean; createdAt: string
}

const ORDER_BADGE: Record<string, { label: string; variant: 'forest'|'teal'|'grey'|'warning'|'danger' }> = {
  PENDING_PAYMENT:      { label: 'Awaiting Payment',   variant: 'warning' },
  PAYMENT_VERIFICATION: { label: 'Verifying Payment',  variant: 'warning' },
  REQUIREMENTS_PENDING: { label: 'Needs Requirements', variant: 'warning' },
  IN_PROGRESS:          { label: 'In Progress',        variant: 'teal'    },
  IN_REVIEW:            { label: 'In Review',          variant: 'teal'    },
  DELIVERED:            { label: 'Delivered',          variant: 'forest'  },
  COMPLETED:            { label: 'Completed',          variant: 'grey'    },
  CANCELLED:            { label: 'Cancelled',          variant: 'danger'  },
}

export default function AdminPanel() {
  const [tab, setTab]               = useState<AdminTab>('gigs')
  const [payments, setPayments]     = useState<PendingPayment[]>([])
  const [gigs, setGigs]             = useState<PendingGig[]>([])
  const [orders, setOrders]         = useState<LiveOrder[]>([])
  const [users, setUsers]           = useState<LiveUser[]>([])
  const [loading, setLoading]       = useState(true)
  const [preview, setPreview]       = useState<PendingPayment | null>(null)
  const [gigPreview, setGigPreview] = useState<PendingGig | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast]           = useState<{ msg: string; type: 'success'|'error' } | null>(null)

  const showToast = (msg: string, type: 'success'|'error') => setToast({ msg, type })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [pr, gr, or_, ur] = await Promise.all([
        fetch('/api/payments?status=PENDING'),
        fetch('/api/gigs/pending'),
        fetch('/api/orders?view=admin'),
        fetch('/api/users'),
      ])
      if (pr.ok) { const d = await pr.json(); setPayments(d.payments || d.data?.payments || []) }
      if (gr.ok) { const d = await gr.json(); setGigs(d.gigs || d.data?.gigs || []) }
      if (or_.ok) { const d = await or_.json(); setOrders(d.orders || d.data?.orders || []) }
      if (ur.ok) { const d = await ur.json(); setUsers(d.users || d.data?.users || []) }
    } catch { showToast('Failed to load data', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handlePayment = async (id: string, action: 'approve'|'reject') => {
    setActionLoading(id)
    try {
      const res  = await fetch(`/api/payments/${id}/verify`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Action failed', 'error'); return }
      setPayments(p => p.filter(x => x.id !== id))
      setPreview(null)
      showToast(action === 'approve' ? '✓ Payment verified. Order is now active.' : 'Payment rejected.', action === 'approve' ? 'success' : 'error')
    } catch { showToast('Network error', 'error') }
    finally { setActionLoading(null) }
  }

  const handleGig = async (id: string, action: 'approve'|'reject') => {
    setActionLoading(id)
    try {
      const res  = await fetch(`/api/admin/gigs/${id}/review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Action failed', 'error'); return }
      setGigs(g => g.filter(x => x.id !== id))
      setGigPreview(null)
      showToast(action === 'approve' ? '✓ Gig approved and published.' : 'Gig rejected.', action === 'approve' ? 'success' : 'error')
    } catch { showToast('Network error', 'error') }
    finally { setActionLoading(null) }
  }

  const TABS: { key: AdminTab; label: string; badge?: number }[] = [
    { key: 'gigs',     label: 'Gig Approvals',       badge: gigs.length     },
    { key: 'payments', label: 'Payment Verification', badge: payments.length },
    { key: 'orders',   label: 'All Orders'                                   },
    { key: 'users',    label: 'Users'                                        },
  ]

  const Spinner = () => (
    <div className="text-center py-16">
      <RefreshCw size={24} className="mx-auto mb-3 text-[var(--grey-light)] animate-spin"/>
      <p className="text-[12px] text-[var(--grey-light)] font-[Jost]">Loading…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar/>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="max-w-7xl mx-auto px-8 py-12 pt-24">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield size={18} className="text-[var(--forest)]"/>
              <p className="text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] font-medium font-[Jost]">Admin Panel</p>
            </div>
            <h1 className="font-display text-4xl font-light text-[var(--charcoal)]">Platform <em>Control Centre</em></h1>
          </div>
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[var(--grey)] hover:text-[var(--forest)] transition-colors font-[Jost] font-medium mt-2">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>{loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--line)] border-[0.5px] border-[var(--line)] mb-10">
          {[
            { num: loading ? '…' : payments.length, label: 'Pending Payments',     icon: <Clock      size={14} className="text-[#d4870a]"       /> },
            { num: loading ? '…' : gigs.length,     label: 'Gigs Awaiting Review', icon: <Eye        size={14} className="text-[var(--teal)]"    /> },
            { num: loading ? '…' : orders.length,   label: 'Total Orders',         icon: <Package    size={14} className="text-[var(--forest)]"  /> },
            { num: loading ? '…' : users.length,    label: 'Registered Users',     icon: <TrendingUp size={14} className="text-[var(--forest)]"  /> },
          ].map(({ num, label, icon }) => (
            <div key={label} className="bg-[var(--paper)] p-6">
              <div className="flex items-center gap-2 mb-2 text-[var(--grey-light)]">{icon}<span className="text-[9px] uppercase tracking-[2px] font-[Jost] font-medium">{label}</span></div>
              <div className="font-display text-3xl font-light text-[var(--charcoal)]">{num}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--line)] mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[2px] font-medium font-[Jost] border-b-2 whitespace-nowrap transition-colors
                ${tab===t.key ? 'border-[var(--forest)] text-[var(--forest)]' : 'border-transparent text-[var(--grey-light)] hover:text-[var(--grey)]'}`}>
              {t.label}
              {t.badge !== undefined && t.badge > 0 && <span className="bg-[#d4870a] text-white text-[9px] px-1.5 py-0.5 font-medium">{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── GIG APPROVALS ── */}
        {tab === 'gigs' && (
          <div className="space-y-4">
            {loading ? <Spinner/> : gigs.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle size={28} className="mx-auto mb-3 text-[var(--forest)]"/>
                <p className="font-display text-xl font-light text-[var(--grey)]">No gigs pending review</p>
              </div>
            ) : gigs.map(g => (
              <div key={g.id} className="border-[0.5px] border-[var(--line)] bg-[var(--paper)]">
                <div className="h-[2px] bg-[var(--teal)]"/>
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse"/>
                        <span className="text-[9px] uppercase tracking-[2px] text-[var(--teal)] font-medium font-[Jost]">Pending Review</span>
                        <Badge variant="grey" size="sm">{g.category}</Badge>
                      </div>
                      <h3 className="text-[15px] font-medium text-[var(--charcoal)] font-[Jost] mb-1">{g.title}</h3>
                      <p className="text-[12px] text-[var(--grey)] font-[Jost] font-light">
                        by <span className="font-medium">{g.seller.name}</span>
                        <span className="text-[var(--grey-light)]"> · {g.seller.email}</span>
                        {g.seller.sellerBio && <span className="text-[var(--grey-light)]"> · {g.seller.sellerBio.slice(0,50)}…</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-xl font-light text-[var(--forest)]">From ₹{g.basicPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-[var(--grey-light)] mt-1 font-[Jost]">{new Date(g.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  {/* Pricing row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[['Basic', g.basicPrice],['Standard', g.standardPrice],['Premium', g.premiumPrice]].map(([l, p]) => (
                      <div key={l as string} className="bg-[var(--paper-dark)] p-3 border-[0.5px] border-[var(--line)]">
                        <p className="text-[9px] uppercase tracking-[1.5px] text-[var(--grey-light)] font-[Jost] font-medium mb-1">{l}</p>
                        <p className="font-display text-lg font-light text-[var(--charcoal)]">₹{(p as number).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {g.techStack.split(',').map(t => (
                      <span key={t} className="text-[9px] uppercase tracking-[1px] text-[var(--grey)] border-[0.5px] border-[var(--line)] px-2 py-0.5 font-mono-co">{t.trim()}</span>
                    ))}
                    <span className="text-[9px] text-[var(--grey-light)] font-[Jost] ml-1">{g.deliveryDays}d delivery</span>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                    <Button size="sm" loading={actionLoading===g.id} onClick={() => handleGig(g.id,'approve')}><CheckCircle size={12}/> Approve & Publish</Button>
                    <Button variant="danger" size="sm" loading={actionLoading===g.id} onClick={() => handleGig(g.id,'reject')}><XCircle size={12}/> Reject</Button>
                    <button onClick={() => setGigPreview(g)} className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] hover:text-[var(--forest)] flex items-center gap-1.5 font-medium font-[Jost] transition-colors">
                      <Eye size={12}/> Full Description
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PAYMENT VERIFICATION ── */}
        {tab === 'payments' && (
          <div className="space-y-4">
            {loading ? <Spinner/> : payments.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle size={28} className="mx-auto mb-3 text-[var(--forest)]"/>
                <p className="font-display text-xl font-light text-[var(--grey)]">All payments verified</p>
              </div>
            ) : payments.map(p => (
              <div key={p.id} className="border-[0.5px] border-[var(--line)] bg-[var(--paper)]">
                <div className="h-[2px] bg-[#d4870a]"/>
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#d4870a] animate-pulse"/>
                        <span className="text-[9px] uppercase tracking-[2px] text-[#d4870a] font-medium font-[Jost]">Pending Verification</span>
                      </div>
                      <h3 className="text-[15px] font-medium text-[var(--charcoal)] font-[Jost]">{p.order.gig.title}</h3>
                      <p className="text-[12px] text-[var(--grey)] font-[Jost] font-light mt-1">
                        Buyer: <span className="font-medium">{p.order.buyer.name}</span>
                        <span className="text-[var(--grey-light)]"> · {p.order.buyer.email}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-light text-[var(--charcoal)]">₹{p.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-[var(--grey-light)] mt-1 font-[Jost]">{new Date(p.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[var(--paper-dark)] mb-5">
                    {[['Order ID', `#${p.order.id.slice(0,8).toUpperCase()}`],['Package', p.order.package.toUpperCase()],['UTR / Txn ID', p.transactionId],['Screenshot', p.screenshot ? '✓ Uploaded' : '✗ Missing']].map(([k,v]) => (
                      <div key={k as string}>
                        <p className="text-[8px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] font-medium mb-0.5">{k}</p>
                        <p className="text-[12px] font-mono-co text-[var(--charcoal)]">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                    <Button size="sm" loading={actionLoading===p.id} onClick={() => handlePayment(p.id,'approve')}><CheckCircle size={12}/> Verify Payment</Button>
                    <Button variant="danger" size="sm" loading={actionLoading===p.id} onClick={() => handlePayment(p.id,'reject')}><XCircle size={12}/> Reject</Button>
                    {p.screenshot && <button onClick={() => setPreview(p)} className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] hover:text-[var(--forest)] flex items-center gap-1.5 font-medium font-[Jost] transition-colors"><Eye size={12}/> View Screenshot</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ALL ORDERS ── */}
        {tab === 'orders' && (
          loading ? <Spinner/> : (
            <table className="w-full border-collapse">
              <thead><tr className="border-b border-[var(--line)]">
                {['Order ID','Gig','Buyer','Seller','Package','Amount','Status','Date'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-medium font-[Jost]">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[var(--grey-light)] font-[Jost] text-sm">No orders yet</td></tr>
                ) : orders.map(o => {
                  const badge = ORDER_BADGE[o.status]
                  return (
                    <tr key={o.id} className="border-b border-[var(--line)] hover:bg-[var(--paper-dark)] transition-colors">
                      <td className="py-4 px-3 font-mono-co text-[11px] text-[var(--grey)]">#{o.id.slice(0,8).toUpperCase()}</td>
                      <td className="py-4 px-3 text-[12px] text-[var(--charcoal)] font-[Jost] max-w-[160px] truncate">{o.gig.title}</td>
                      <td className="py-4 px-3 text-[12px] text-[var(--grey)] font-[Jost]">{o.buyer.name}</td>
                      <td className="py-4 px-3 text-[12px] text-[var(--grey)] font-[Jost]">{o.seller.name}</td>
                      <td className="py-4 px-3 text-[11px] text-[var(--grey-light)] font-[Jost] capitalize">{o.package}</td>
                      <td className="py-4 px-3 text-[12px] font-medium text-[var(--charcoal)] font-[Jost]">₹{o.price.toLocaleString()}</td>
                      <td className="py-4 px-3">{badge && <Badge variant={badge.variant} size="sm">{badge.label}</Badge>}</td>
                      <td className="py-4 px-3 text-[11px] text-[var(--grey-light)] font-[Jost]">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          loading ? <Spinner/> : (
            <table className="w-full border-collapse">
              <thead><tr className="border-b border-[var(--line)]">
                {['Name','Email','Role','Joined'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-medium font-[Jost]">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-[var(--grey-light)] font-[Jost] text-sm">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-[var(--line)] hover:bg-[var(--paper-dark)] transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[var(--forest)] flex items-center justify-center text-[var(--paper)] text-[11px] font-medium shrink-0">{u.name.charAt(0).toUpperCase()}</div>
                        <span className="text-[13px] font-medium text-[var(--charcoal)] font-[Jost]">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-[12px] text-[var(--grey)] font-mono-co">{u.email}</td>
                    <td className="py-4 px-3"><Badge variant={u.role==='ADMIN'?'danger':u.isSeller?'forest':'teal'} size="sm">{u.role==='ADMIN'?'Admin':u.isSeller?'Seller':'Buyer'}</Badge></td>
                    <td className="py-4 px-3 text-[11px] text-[var(--grey-light)] font-[Jost]">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Payment screenshot modal */}
      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title="Payment Screenshot" size="md">
        <div className="aspect-video bg-[var(--paper-dark)] flex items-center justify-center border-[0.5px] border-[var(--line)] mb-4 overflow-hidden">
          {preview?.screenshot
            ? <img src={preview.screenshot} alt="Payment proof" className="max-w-full max-h-full object-contain"/>
            : <p className="text-[12px] text-[var(--grey-light)] font-[Jost]">No screenshot uploaded</p>}
        </div>
        <div className="flex gap-3">
          <Button size="md" className="flex-1" loading={actionLoading===preview?.id} onClick={() => preview && handlePayment(preview.id,'approve')}><CheckCircle size={13}/> Verify Payment</Button>
          <Button variant="danger" size="md" loading={actionLoading===preview?.id} onClick={() => preview && handlePayment(preview.id,'reject')}><XCircle size={13}/> Reject</Button>
        </div>
      </Modal>

      {/* Gig description modal */}
      <Modal isOpen={!!gigPreview} onClose={() => setGigPreview(null)} title="Gig Details" size="lg">
        {gigPreview && (
          <div className="space-y-4">
            <p className="text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] font-medium mb-1">Description</p>
            <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light leading-relaxed whitespace-pre-wrap">{gigPreview.description}</p>
            <div className="pt-4 border-t border-[var(--line)] flex gap-3">
              <Button size="md" className="flex-1" loading={actionLoading===gigPreview.id} onClick={() => handleGig(gigPreview.id,'approve')}><CheckCircle size={13}/> Approve & Publish</Button>
              <Button variant="danger" size="md" loading={actionLoading===gigPreview.id} onClick={() => handleGig(gigPreview.id,'reject')}><XCircle size={13}/> Reject</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
