'use client'
import Modal from './Modal'
import Button from './Button'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export default function ConfirmDialog({
  isOpen, title, message, onConfirm, onCancel, 
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'primary', loading = false
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="text-center py-2">
        <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-5 border-2 ${variant === 'danger' ? 'border-[#c0392b] text-[#c0392b]' : 'border-[var(--forest)] text-[var(--forest)]'}`}>
          <AlertCircle size={24} />
        </div>
        <h3 className="font-display text-2xl font-light text-[var(--charcoal)] mb-3">{title}</h3>
        <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light leading-relaxed mb-8">
          {message}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="flex-1 border border-[var(--line)]" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="sm" className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
