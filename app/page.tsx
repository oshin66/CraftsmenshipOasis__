'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Code2, FlaskConical, GraduationCap, Shield, Clock, RefreshCw } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GigCard from '@/components/gig/GigCard'
import Button from '@/components/ui/Button'

const CATEGORIES = [
  { icon: Zap,           label: 'AI Automation',  count: 124 },
  { icon: Code2,         label: 'Web Development', count: 213 },
  { icon: FlaskConical,  label: 'Data Science',    count: 87  },
  { icon: GraduationCap, label: 'CS Academic',     count: 156 },
]

const STATS = [
  { num: '47+', label: 'Projects Shipped' },
  { num: '32',  label: 'Vetted Engineers' },
  { num: '98%', label: 'Delivery Rate'   },
  { num: '4.9★',label: 'Avg. Rating'     },
]

const TRUST = [
  { icon: Shield, title: 'Vetted Talent',       desc: 'Every student is reviewed for skill, communication, and reliability before joining.' },
  { icon: Clock,  title: 'Managed Delivery',    desc: 'Our team oversees quality at every milestone so you never get a code dump.' },
  { icon: Zap,    title: 'Transparent Pricing', desc: 'Fixed prices agreed upfront. No hidden costs, no surprises.' },
]

export default function HomePage() {
  const [gigs, setGigs] = useState<any[]>([])
  const [gigsLoading, setGigsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gigs?limit=6&sort=popular')
      .then(r => r.json())
      .then(d => setGigs(d.gigs || d.data?.gigs || []))
      .catch(() => {})
      .finally(() => setGigsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] tracking-[5px] uppercase text-[var(--forest)] opacity-25 whitespace-nowrap hidden lg:block select-none">
          A C C E L E R A T E &nbsp;·&nbsp; I N N O V A T E &nbsp;·&nbsp; C R E A T E
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-16 min-h-[calc(100vh-64px)] flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-16">
            {/* Left */}
            <div className="animate-rise">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-[0.5px] bg-[var(--forest-light)]" />
                <span className="text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] font-medium">Managed Student Tech Platform</span>
              </div>
              <h1 className="font-display text-[clamp(38px,5.5vw,70px)] leading-[1.05] font-light text-[var(--charcoal)] mb-6">
                Get your college<br/>software projects<br/>done by <em className="text-[var(--forest)]">experts.</em>
              </h1>
              <p className="text-[14px] leading-[1.9] text-[var(--grey)] max-w-md mb-8">
                The boutique tech forge where vetted student engineers build AI automation, web apps, and CS projects for brands.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/browse"><Button size="lg">Browse Gigs →</Button></Link>
                <Link href="/auth/register"><Button variant="outline" size="lg">Start as Seller</Button></Link>
              </div>
              <div className="flex gap-0 mt-12 pt-8 border-t border-[var(--line)]">
                {STATS.map((s, i) => (
                  <div key={s.label} className={`flex-1 ${i > 0 ? 'border-l border-[var(--line)] pl-5 ml-5' : ''}`}>
                    <div className="font-display text-[28px] font-light text-[var(--forest)]">{s.num}</div>
                    <div className="text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — SVG Brain */}
            <div className="relative flex items-center justify-center" style={{ animation: 'fadeIn 1.2s ease 0.4s both' }}>
              {[
                { text: '{ AI_AGENT = }',      top: '6%',  left: '58%', delay: '0s'   },
                { text: 'import langchain',     top: '18%', left: '74%', delay: '1.8s' },
                { text: 'model.predict(X)',     top: '52%', left: '66%', delay: '0.9s' },
                { text: 'async def pipeline()', top: '70%', left: '52%', delay: '2.7s' },
                { text: 'torch.nn.Module',      top: '36%', left: '2%',  delay: '1.4s' },
              ].map(tag => (
                <div key={tag.text} className="absolute glass-card px-3 py-1.5 text-[9.5px] font-mono-co text-[var(--forest)] animate-float whitespace-nowrap z-10"
                  style={{ top: tag.top, left: tag.left, animationDelay: tag.delay }}>
                  {tag.text}
                </div>
              ))}
              <svg viewBox="0 0 480 520" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[460px]">
                <defs>
                  <radialGradient id="rg1h" cx="45%" cy="38%" r="55%">
                    <stop offset="0%" stopColor="#d0e9df" stopOpacity="0.95"/>
                    <stop offset="55%" stopColor="#a8d4c4" stopOpacity="0.75"/>
                    <stop offset="100%" stopColor="#1B3D2F" stopOpacity="0.2"/>
                  </radialGradient>
                  <linearGradient id="lg1h" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3ecf8e" stopOpacity="0"/>
                    <stop offset="40%" stopColor="#3ecf8e" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#1B3D2F" stopOpacity="0"/>
                  </linearGradient>
                  <filter id="fsh">
                    <feDropShadow dx="6" dy="10" stdDeviation="18" floodColor="#1B3D2F" floodOpacity="0.1"/>
                  </filter>
                </defs>
                <ellipse cx="240" cy="248" rx="165" ry="145" fill="#1B3D2F" fillOpacity="0.04"/>
                <ellipse cx="240" cy="425" rx="98" ry="13" fill="#3a2010" fillOpacity="0.65"/>
                <rect x="210" y="396" width="60" height="30" rx="3" fill="#3a2010" fillOpacity="0.85"/>
                <g filter="url(#fsh)">
                  <path d="M142 292 C130 252 124 208 140 176 C158 144 184 132 212 134 C220 186 216 240 214 292 Z" fill="url(#rg1h)" stroke="#1B3D2F" strokeWidth="0.5" strokeOpacity="0.25"/>
                  <path d="M160 280 C150 256 146 222 156 198 C170 170 188 160 210 162 C215 200 212 242 210 280 Z" fill="#caeadf" fillOpacity="0.32"/>
                  <path d="M338 292 C350 252 356 208 340 176 C322 144 296 132 268 134 C260 186 264 240 266 292 Z" fill="url(#rg1h)" stroke="#1B3D2F" strokeWidth="0.5" strokeOpacity="0.25"/>
                  <path d="M320 280 C330 256 334 222 324 198 C310 170 292 160 270 162 C265 200 268 242 270 280 Z" fill="#caeadf" fillOpacity="0.32"/>
                  <path d="M214 292 C213 334 218 368 240 396 C262 368 267 334 266 292 Z" fill="url(#rg1h)"/>
                  <path d="M200 134 L214 112 L240 100 L266 112 L280 134" fill="url(#rg1h)" stroke="#1B3D2F" strokeWidth="0.4" strokeOpacity="0.28"/>
                  <path d="M214 112 L240 86 L266 112" fill="url(#rg1h)" stroke="#1B3D2F" strokeWidth="0.4" strokeOpacity="0.28"/>
                  <path d="M228 100 L240 84 L252 100 L240 107 Z" fill="white" fillOpacity="0.3"/>
                  <line x1="240" y1="134" x2="240" y2="394" stroke="#1B3D2F" strokeWidth="0.25" strokeOpacity="0.1"/>
                  <line x1="142" y1="226" x2="338" y2="226" stroke="#1B3D2F" strokeWidth="0.25" strokeOpacity="0.07"/>
                </g>
                <path d="M178 320 C170 298 163 266 172 236 C181 206 190 180 200 158" stroke="url(#lg1h)" strokeWidth="0.9" fill="none">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite"/>
                </path>
                <path d="M302 322 C310 300 316 268 307 238 C298 208 289 182 278 160" stroke="url(#lg1h)" strokeWidth="0.9" fill="none">
                  <animate attributeName="opacity" values="0.25;0.7;0.25" dur="5s" begin="1s" repeatCount="indefinite"/>
                </path>
                {([[156,238],[170,192],[314,234],[240,346]] as [number,number][]).map(([cx,cy],i) => (
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill="#3ecf8e" fillOpacity="0.45">
                    <animate attributeName="opacity" values="0.25;0.65;0.25" dur={`${3+i*0.4}s`} begin={`${i*0.8}s`} repeatCount="indefinite"/>
                  </circle>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-t border-b border-[var(--line)] bg-[var(--paper-dark)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <Link key={cat.label} href={`/browse?category=${encodeURIComponent(cat.label)}`}
                  className={`flex items-center gap-4 p-6 group transition-colors hover:bg-[var(--paper)] ${i > 0 ? 'border-l border-[var(--line)]' : ''}`}>
                  <div className="w-9 h-9 border border-[var(--line)] flex items-center justify-center group-hover:border-[var(--forest)] transition-colors">
                    <Icon size={16} className="text-[var(--grey)] group-hover:text-[var(--forest)] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[13px] text-[var(--charcoal)] group-hover:text-[var(--forest)] transition-colors">{cat.label}</div>
                    <div className="text-[10px] text-[var(--grey-light)] mt-0.5">{cat.count} gigs</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED GIGS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="flex items-center gap-3 text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] mb-3">
              <span className="w-6 h-[0.5px] bg-[var(--forest-light)] inline-block"/>Featured Work
            </p>
            <h2 className="font-display text-[40px] font-light text-[var(--charcoal)]">Popular <em className="text-[var(--forest)]">Gigs</em></h2>
          </div>
          <Link href="/browse" className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[var(--forest)] opacity-65 hover:opacity-100 transition-opacity">
            View All <ArrowRight size={12}/>
          </Link>
        </div>
        {gigsLoading ? (
          <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin text-[var(--grey-light)]"/></div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--grey)] font-[Jost]">No gigs published yet. Be the first seller!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gigs.map(gig => <GigCard key={gig.id} gig={gig}/>)}
          </div>
        )}
      </section>

      {/* TRUST */}
      <section className="bg-[var(--forest)] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <p className="flex items-center gap-3 text-[9px] uppercase tracking-[4px] text-[var(--teal-pale)] opacity-60 mb-3">
            <span className="w-6 h-[0.5px] bg-[var(--teal-pale)] opacity-60 inline-block"/>Why Craftsmanship Oasis
          </p>
          <h2 className="font-display text-[40px] font-light text-[var(--paper)] mb-14">The <em className="text-[var(--teal-pale)]">Managed</em> Difference</h2>
          <div className="grid md:grid-cols-3 gap-0">
            {TRUST.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={item.title} className={`p-10 ${i > 0 ? 'border-l border-white/10' : ''}`}>
                  <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-6">
                    <Icon size={18} className="text-[var(--teal-pale)]" />
                  </div>
                  <h3 className="font-display text-[22px] font-light text-[var(--paper)] mb-3">{item.title}</h3>
                  <p className="text-[12px] text-white/45 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-20 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-[var(--line)]">
        <div>
          <h2 className="font-display text-[36px] font-light text-[var(--charcoal)] mb-2">
            Ready to build something <em className="text-[var(--forest)]">great?</em>
          </h2>
          <p className="text-[13px] text-[var(--grey)]">Browse 580+ student-built services or post your project.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/browse"><Button size="lg">Browse Gigs</Button></Link>
          <Link href="/auth/register"><Button variant="outline" size="lg">Join as Seller</Button></Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
