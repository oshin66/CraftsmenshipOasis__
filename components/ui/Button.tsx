'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary: 'bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--forest-mid)] border-transparent',
  outline: 'bg-transparent text-[var(--forest)] border-[var(--forest)] hover:bg-[var(--forest)] hover:text-[var(--paper)]',
  ghost:   'bg-transparent text-[var(--grey)] border-transparent hover:text-[var(--forest)]',
  danger:  'bg-[#c0392b] text-white border-transparent hover:bg-[#a93226]',
}
const sizes = {
  sm: 'px-4 py-2 text-[10px] tracking-[2px]',
  md: 'px-6 py-3 text-[10px] tracking-[2.5px]',
  lg: 'px-8 py-4 text-[10px] tracking-[3px]',
}

export default function Button({
  variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        border-[0.5px] uppercase font-medium font-[Jost]
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        cursor-pointer active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
        ${loading ? 'animate-soft-pulse' : ''}
      `}
    >
      {loading && <Loader2 size={12} className="animate-spin" />}
      {!loading && children}
      {loading && <span className="opacity-70">{children}</span>}
    </button>
  )
}
