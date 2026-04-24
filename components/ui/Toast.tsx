'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const icons = { success: CheckCircle, error: XCircle, info: AlertCircle }
const colors = {
  success: 'bg-[var(--forest)] text-[var(--paper)]',
  error:   'bg-[#c0392b] text-white',
  info:    'bg-[var(--charcoal)] text-[var(--paper)]',
}

export default function Toast({ message, type = 'success', duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const Icon = icons[type]

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10)
    const hide = setTimeout(() => { setVisible(false); setTimeout(onClose, 400) }, duration)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [duration, onClose])

  return (
    <div className={`
      fixed bottom-8 right-8 z-[9999] flex items-center gap-3
      px-6 py-4 text-[13px] font-[Jost] font-medium
      transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
      shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-[0.5px] border-white/20 backdrop-blur-md
      ${colors[type]}
      ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
    `}>
      <div className="bg-white/10 rounded-full p-1"><Icon size={14} /></div>
      <span className="tracking-[0.5px]">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 500) }} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}
