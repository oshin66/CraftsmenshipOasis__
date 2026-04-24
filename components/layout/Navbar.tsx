'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useSimpleAuth } from '@/lib/useSimpleAuth'

export default function Navbar() {
  const { user, loading } = useSimpleAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isSellerToggle, setIsSellerToggle] = useState(false)

  const userName = user?.name
  const userRole = user?.role

  return (
    <nav className="fixed top-0 left-0 right-0 z-[400] border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 border border-[var(--forest)] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4v4L6 11 1 8V4z" stroke="var(--forest)" strokeWidth="0.75" fill="none"/>
              <circle cx="6" cy="6" r="1.5" fill="var(--forest)" opacity="0.6"/>
            </svg>
          </div>
          <span className="font-display text-[15px] tracking-[2px] uppercase text-[var(--forest)] hidden sm:block">
            Craftsmanship <span className="font-light text-[var(--grey)]">Oasis</span>
          </span>
        </Link>

        <form 
          onSubmit={(e) => {
            e.preventDefault()
            const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value
            window.location.href = `/browse?search=${encodeURIComponent(query)}`
          }}
          className="flex-1 max-w-md relative hidden md:block"
        >
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grey-light)]" />
          <input 
            type="text" 
            name="search"
            placeholder="Search for software projects, AI tools..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] text-[13px] font-[Jost] font-light text-[var(--charcoal)] placeholder:text-[var(--grey-light)] outline-none focus:border-[var(--forest)] transition-colors" 
          />
        </form>

        <div className="flex items-center gap-3 ml-auto">
          {!loading && !user && (
            <button onClick={() => setIsSellerToggle(!isSellerToggle)}
              className="hidden md:flex items-center gap-2 text-[11px] tracking-[1.5px] uppercase text-[var(--grey)] hover:text-[var(--forest)] transition-colors font-medium">
              <div className={`w-8 h-4 rounded-full transition-colors relative ${isSellerToggle ? 'bg-[var(--forest)]' : 'bg-[var(--grey-light)]'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isSellerToggle ? 'left-4' : 'left-0.5'}`} />
              </div>
              {isSellerToggle ? 'Seller Mode' : 'Become a Seller'}
            </button>
          )}

          {userRole === 'ADMIN' && (
            <Link href="/admin"><Button variant="outline" size="sm">Admin Panel</Button></Link>
          )}
          {userRole === 'SELLER' && (
            <Link href="/dashboard/seller"><Button variant="outline" size="sm">Dashboard</Button></Link>
          )}
          {userRole === 'BUYER' && (
            <Link href="/dashboard/buyer"><Button variant="outline" size="sm">My Orders</Button></Link>
          )}

          {!loading && !user && (
            <>
              <Link href="/auth/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link href="/auth/register"><Button size="sm">Join Free</Button></Link>
            </>
          )}

          {user && userName && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[var(--forest)] flex items-center justify-center text-[var(--paper)] text-[11px] font-medium uppercase font-[Jost]">
                {userName.charAt(0)}
              </div>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/'
                }}
                className="text-[10px] uppercase tracking-[1.5px] text-[var(--grey)] hover:text-[var(--danger)] transition-colors"
              >Sign out</button>
            </div>
          )}

          <button className="md:hidden ml-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--paper)] px-6 py-4 flex flex-col gap-4 animate-rise">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              const query = (e.currentTarget.elements.namedItem('search-mobile') as HTMLInputElement).value
              window.location.href = `/browse?search=${encodeURIComponent(query)}`
            }}
          >
            <input 
              type="text" 
              name="search-mobile"
              placeholder="Search projects..." 
              className="input-underline text-sm w-full" 
            />
          </form>
          <Link href="/browse" className="text-sm text-[var(--grey)] hover:text-[var(--forest)] tracking-wide">Browse Gigs</Link>
          {!user && (
            <>
              <Link href="/auth/login" className="text-sm text-[var(--grey)] hover:text-[var(--forest)] tracking-wide">Login</Link>
              <Link href="/auth/register" className="text-sm text-[var(--forest)] tracking-wide font-medium">Join Free</Link>
            </>
          )}
          {user && <Link href={user.role === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer'} className="text-sm text-[var(--forest)]">My Dashboard</Link>}
        </div>
      )}
    </nav>
  )
}
