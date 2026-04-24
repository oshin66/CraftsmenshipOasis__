'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Grid3X3, List, SlidersHorizontal, RefreshCw } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GigCard from '@/components/gig/GigCard'
import FilterSidebar from '@/components/gig/FilterSidebar'

const SORT_OPTIONS = ['Newest','Best Rated','Lowest Price','Highest Price']

interface Filters { category:string; techStack:string[]; budgetMin:number; budgetMax:number; deliveryDays:number }
const DEFAULT: Filters = { category:'All', techStack:[], budgetMin:0, budgetMax:100000, deliveryDays:0 }

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-[var(--grey-light)]" />
      </div>
    }>
      <BrowseInner />
    </Suspense>
  )
}

function BrowseInner() {
  const searchParams = useSearchParams()
  const searchQuery  = searchParams.get('search') ?? ''

  const [filters, setFilters] = useState<Filters>(DEFAULT)
  const [sort, setSort]       = useState('Newest')
  const [gigs, setGigs]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFilter, setMobileFilter] = useState(false)
  const [view, setView] = useState<'grid'|'list'>('grid')

  const fetchGigs = useCallback(async () => {
    setLoading(true)
    try {
      const sp = new URLSearchParams()
      if (filters.category !== 'All') sp.append('category', filters.category)
      if (filters.techStack.length)   sp.append('techStack', filters.techStack.join(','))
      if (filters.budgetMin > 0)      sp.append('budgetMin', String(filters.budgetMin))
      if (filters.budgetMax < 100000) sp.append('budgetMax', String(filters.budgetMax))
      if (filters.deliveryDays > 0)   sp.append('deliveryDays', String(filters.deliveryDays))
      if (searchQuery)                sp.append('search', searchQuery)
      
      const sortVal = 
        sort === 'Best Rated'   ? 'rating' :
        sort === 'Lowest Price' ? 'price_asc' :
        sort === 'Highest Price'? 'price_desc' : 'newest'
      sp.append('sort', sortVal)

      const res = await fetch(`/api/gigs?${sp.toString()}`)
      if (res.ok) {
        const d = await res.json()
        setGigs(d.gigs || d.data?.gigs || [])
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [filters, sort, searchQuery])

  useEffect(() => {
    fetchGigs()
  }, [fetchGigs])

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar/>
      <div className="pt-16">
        <div className="border-b border-[var(--line)] bg-[var(--paper-dark)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-[26px] font-light text-[var(--charcoal)]">
                {searchQuery ? `Search: ${searchQuery}` : filters.category === 'All' ? 'All Gigs' : filters.category}
              </h1>
              <p className="text-[11px] text-[var(--grey-light)] mt-0.5">{gigs.length} services available</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>setMobileFilter(true)} className="md:hidden flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-[var(--grey)] border border-[var(--line)] px-3 py-2">
                <SlidersHorizontal size={12}/> Filters
              </button>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="text-[11px] bg-[var(--paper)] border-[0.5px] border-[var(--line)] px-3 py-2 text-[var(--grey)] outline-none cursor-pointer font-[Jost]">
                {SORT_OPTIONS.map(o=><option key={o}>{o}</option>)}
              </select>
              <div className="flex border-[0.5px] border-[var(--line)]">
                <button onClick={()=>setView('grid')} className={`p-2 transition-colors ${view==='grid'?'bg-[var(--forest)] text-[var(--paper)]':'text-[var(--grey)]'}`}><Grid3X3 size={14}/></button>
                <button onClick={()=>setView('list')} className={`p-2 border-l border-[var(--line)] transition-colors ${view==='list'?'bg-[var(--forest)] text-[var(--paper)]':'text-[var(--grey)]'}`}><List size={14}/></button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-10">
          <div className="flex gap-10">
            <div className="hidden md:block"><FilterSidebar filters={filters} onChange={setFilters}/></div>
            {mobileFilter && (
              <div className="fixed inset-0 z-[300] md:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={()=>setMobileFilter(false)}/>
                <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--paper)] p-6 overflow-y-auto animate-rise">
                  <FilterSidebar filters={filters} onChange={f=>{setFilters(f);setMobileFilter(false)}}/>
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex justify-center py-24"><RefreshCw size={24} className="animate-spin text-[var(--grey-light)]"/></div>
              ) : gigs.length===0 ? (
                <div className="flex flex-col items-center py-24 text-center">
                  <p className="font-display text-[22px] font-light text-[var(--grey)] mb-3">No gigs match your criteria</p>
                  <button onClick={()=>{setFilters(DEFAULT); window.location.href='/browse'}} className="text-[11px] uppercase tracking-[2px] text-[var(--forest)]">Clear All Filters</button>
                </div>
              ) : view==='grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {gigs.map(gig=><GigCard key={gig.id} gig={gig}/>)}
                </div>
              ) : (
                <div className="flex flex-col border-[0.5px] border-[var(--line)]">
                  {gigs.map(gig=>(
                    <a key={gig.id} href={`/gig/${gig.id}`} className="flex gap-5 p-5 border-b border-[var(--line)] last:border-0 hover:bg-[var(--paper-dark)] transition-colors group">
                      <div className="w-32 h-20 bg-[var(--paper-dark)] border border-[var(--line)] shrink-0 flex items-center justify-center opacity-40">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2L26 8v12l-12 6L2 20V8z" stroke="var(--forest)" strokeWidth="0.8"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-[17px] font-light group-hover:text-[var(--forest)] transition-colors mb-1 line-clamp-1">{gig.title}</h3>
                        <p className="text-[12px] text-[var(--grey)] line-clamp-2 mb-2">{gig.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--grey-light)] uppercase tracking-[1px]">
                          <span>{gig.category}</span><span>·</span><span>{gig.deliveryDays}d</span><span>·</span><span>★{gig.rating}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[9px] uppercase tracking-[1.5px] text-[var(--grey-light)] mb-1">From</div>
                        <div className="font-display text-[22px] font-light text-[var(--forest)]">₹{gig.basicPrice.toLocaleString()}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
