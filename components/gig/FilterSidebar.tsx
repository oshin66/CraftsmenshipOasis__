'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Filters {
  category: string
  techStack: string[]
  budgetMin: number
  budgetMax: number
  deliveryDays: number
}

interface FilterSidebarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const CATEGORIES = ['All', 'AI Automation', 'Web Development', 'CS Academic', 'Data Science', 'Mobile App']
const TECH_STACKS = ['Python', 'Django', 'React', 'Next.js', 'FastAPI', 'LangChain', 'PyTorch', 'Node.js', 'Java', 'Flutter']
const DELIVERY_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: 'Up to 3 days', value: 3 },
  { label: 'Up to 7 days', value: 7 },
  { label: 'Up to 14 days', value: 14 },
]

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({ category: true, tech: true, budget: true, delivery: true })

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [key]: !s[key] }))

  const toggleTech = (tech: string) => {
    const next = filters.techStack.includes(tech)
      ? filters.techStack.filter(t => t !== tech)
      : [...filters.techStack, tech]
    onChange({ ...filters, techStack: next })
  }

  const reset = () => onChange({ category: 'All', techStack: [], budgetMin: 0, budgetMax: 100000, deliveryDays: 0 })

  return (
    <div className="w-60 shrink-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[var(--forest)]" />
          <span className="text-[11px] uppercase tracking-[2px] font-medium text-[var(--charcoal)]">Filters</span>
        </div>
        <button onClick={reset} className="text-[10px] text-[var(--grey)] hover:text-[var(--forest)] uppercase tracking-[1px] transition-colors">
          Reset
        </button>
      </div>

      {/* Category */}
      <div className="border-t border-[var(--line)] py-4">
        <button onClick={() => toggle('category')} className="flex items-center justify-between w-full mb-3">
          <span className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] font-medium">Category</span>
          {openSections.category ? <ChevronUp size={12} className="text-[var(--grey-light)]"/> : <ChevronDown size={12} className="text-[var(--grey-light)]"/>}
        </button>
        {openSections.category && (
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onChange({ ...filters, category: cat })}
                className={`text-left text-[12px] py-1 px-2 transition-all ${
                  filters.category === cat
                    ? 'text-[var(--forest)] bg-[var(--teal-pale)]/40 font-medium'
                    : 'text-[var(--grey)] hover:text-[var(--forest)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="border-t border-[var(--line)] py-4">
        <button onClick={() => toggle('tech')} className="flex items-center justify-between w-full mb-3">
          <span className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] font-medium">Tech Stack</span>
          {openSections.tech ? <ChevronUp size={12} className="text-[var(--grey-light)]"/> : <ChevronDown size={12} className="text-[var(--grey-light)]"/>}
        </button>
        {openSections.tech && (
          <div className="flex flex-wrap gap-2">
            {TECH_STACKS.map(tech => (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`text-[9px] uppercase tracking-[1px] border-[0.5px] px-2 py-1 transition-all font-mono-co ${
                  filters.techStack.includes(tech)
                    ? 'border-[var(--forest)] text-[var(--forest)] bg-[var(--forest)]/5'
                    : 'border-[var(--line)] text-[var(--grey)] hover:border-[var(--forest-light)]'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="border-t border-[var(--line)] py-4">
        <button onClick={() => toggle('budget')} className="flex items-center justify-between w-full mb-3">
          <span className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] font-medium">Budget (₹)</span>
          {openSections.budget ? <ChevronUp size={12} className="text-[var(--grey-light)]"/> : <ChevronDown size={12} className="text-[var(--grey-light)]"/>}
        </button>
        {openSections.budget && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={filters.budgetMin || ''}
                onChange={e => onChange({ ...filters, budgetMin: Number(e.target.value) })}
                className="input-underline text-[12px] w-full"
              />
              <span className="text-[var(--grey-light)] text-xs">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.budgetMax === 100000 ? '' : filters.budgetMax}
                onChange={e => onChange({ ...filters, budgetMax: Number(e.target.value) || 100000 })}
                className="input-underline text-[12px] w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Delivery */}
      <div className="border-t border-[var(--line)] py-4">
        <button onClick={() => toggle('delivery')} className="flex items-center justify-between w-full mb-3">
          <span className="text-[10px] uppercase tracking-[2px] text-[var(--grey)] font-medium">Delivery Time</span>
          {openSections.delivery ? <ChevronUp size={12} className="text-[var(--grey-light)]"/> : <ChevronDown size={12} className="text-[var(--grey-light)]"/>}
        </button>
        {openSections.delivery && (
          <div className="flex flex-col gap-1.5">
            {DELIVERY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, deliveryDays: opt.value })}
                className={`text-left text-[12px] py-1 px-2 transition-all ${
                  filters.deliveryDays === opt.value
                    ? 'text-[var(--forest)] bg-[var(--teal-pale)]/40 font-medium'
                    : 'text-[var(--grey)] hover:text-[var(--forest)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
