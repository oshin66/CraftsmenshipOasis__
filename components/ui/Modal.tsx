'use client'
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--charcoal)]/30 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`
        relative w-full ${sizes[size]}
        bg-[var(--paper)] border-[0.5px] border-[var(--line)] shadow-[0_12px_40px_rgba(0,0,0,0.1)]
        animate-scale-in p-8
      `}>
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--forest)]" />
 
        {title && (
          <div className="flex items-start justify-between mb-8">
            <h2 className="font-display text-3xl font-light text-[var(--charcoal)] tracking-tight">{title}</h2>
            <button onClick={onClose} className="text-[var(--grey-light)] hover:text-[var(--forest)] transition-all duration-300 hover:rotate-90 mt-1">
              <X size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} className="absolute top-6 right-6 text-[var(--grey-light)] hover:text-[var(--forest)] transition-all duration-300 hover:rotate-90">
            <X size={20} />
          </button>
        )}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
