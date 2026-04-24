import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'forest' | 'teal' | 'grey' | 'warning' | 'danger' | 'success'
  size?: 'sm' | 'md'
}

const variants = {
  forest:  'border-[var(--forest)] text-[var(--forest)]',
  teal:    'border-[var(--teal)] text-[var(--teal)]',
  grey:    'border-[var(--grey-light)] text-[var(--grey)]',
  warning: 'border-[#d4870a] text-[#d4870a]',
  danger:  'border-[#c0392b] text-[#c0392b]',
  success: 'bg-[var(--forest)]/10 border-[var(--forest)] text-[var(--forest)]',
}
const sizes = {
  sm: 'px-2 py-0.5 text-[8px] tracking-[1.5px]',
  md: 'px-3 py-1 text-[9px] tracking-[1.5px]',
}

export default function Badge({ children, variant = 'forest', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-block uppercase border-[0.5px] font-[Jost] font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
