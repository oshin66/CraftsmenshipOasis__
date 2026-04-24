'use client'
import { useState, useRef } from 'react'
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  onSuccess: () => void
}

type Stage = 'qr' | 'uploading' | 'pending'

export default function PaymentModal({ isOpen, onClose, amount, orderId, onSuccess }: PaymentModalProps) {
  const [stage, setStage] = useState<Stage>('qr')
  const [txnId, setTxnId] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Encode a minimal UPI QR SVG inline (placeholder — in production use a real QR library)
  const upiString = `upi://pay?pa=craftsmenship.oasis@upi&pn=Craftsmanship+Oasis&am=${amount}&cu=INR&tn=Order+${orderId}`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setScreenshot(file)
  }

  const handleSubmit = async () => {
    if (!txnId.trim() || !screenshot) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500)) // simulate API call
    setLoading(false)
    setStage('pending')
  }

  const handleConfirm = () => {
    onSuccess()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment" size="md">
      {stage === 'qr' && (
        <div className="flex flex-col gap-5">
          <div className="bg-[var(--teal-pale)]/30 border border-[var(--line)] p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-[var(--forest)] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[var(--grey)] leading-relaxed">
              Pay via UPI to complete your order. After payment, upload your transaction screenshot for verification.
            </p>
          </div>

          {/* Amount */}
          <div className="text-center py-2">
            <p className="text-[10px] uppercase tracking-[3px] text-[var(--grey-light)] mb-1">Amount to Pay</p>
            <p className="font-display text-[42px] font-light text-[var(--forest)]">₹{amount.toLocaleString()}</p>
          </div>

          {/* QR Code placeholder */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-48 h-48 border-[0.5px] border-[var(--line)] bg-white flex items-center justify-center p-2">
              {/* Real QR — use `qrcode.react` in production */}
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
                <rect x="5" y="5" width="35" height="35" fill="none" stroke="var(--forest)" strokeWidth="3"/>
                <rect x="10" y="10" width="25" height="25" fill="var(--forest)" opacity="0.8"/>
                <rect x="60" y="5" width="35" height="35" fill="none" stroke="var(--forest)" strokeWidth="3"/>
                <rect x="65" y="10" width="25" height="25" fill="var(--forest)" opacity="0.8"/>
                <rect x="5" y="60" width="35" height="35" fill="none" stroke="var(--forest)" strokeWidth="3"/>
                <rect x="10" y="65" width="25" height="25" fill="var(--forest)" opacity="0.8"/>
                {[20,28,36,44,52,60,68,76,84].map((x,i)=>
                  [20,28,36,44,52,60,68,76,84].map((y,j)=>
                    (i+j)%2===0 && !(x<45&&y<45) && !(x>55&&y<45) && !(x<45&&y>55)
                      ? <rect key={`${i}-${j}`} x={x} y={y} width="6" height="6" fill="var(--forest)" opacity="0.6"/>
                      : null
                  )
                )}
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)]">UPI ID</p>
              <p className="font-mono-co text-[13px] text-[var(--charcoal)] mt-0.5">craftsmenship.oasis@upi</p>
            </div>
          </div>

          <Button onClick={() => setStage('uploading')} size="lg" className="w-full">
            I Have Paid — Continue →
          </Button>
        </div>
      )}

      {stage === 'uploading' && (
        <div className="flex flex-col gap-5">
          <p className="text-[12px] text-[var(--grey)] leading-relaxed">
            Provide your UPI transaction ID and upload a screenshot of the payment confirmation.
          </p>

          {/* Transaction ID */}
          <div>
            <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2">Transaction ID *</label>
            <input
              type="text"
              className="input-underline"
              placeholder="e.g. UPI123456789"
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2">Payment Screenshot *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`
                border-[0.5px] border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors
                ${screenshot ? 'border-[var(--forest)] bg-[var(--teal-pale)]/20' : 'border-[var(--grey-light)] hover:border-[var(--forest)]'}
              `}
            >
              <Upload size={20} className="text-[var(--grey-light)]" />
              {screenshot
                ? <p className="text-[12px] text-[var(--forest)]">{screenshot.name}</p>
                : <p className="text-[12px] text-[var(--grey)]">Click to upload screenshot</p>
              }
              <p className="text-[10px] text-[var(--grey-light)]">PNG, JPG up to 5MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStage('qr')} className="flex-1">← Back</Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!txnId.trim() || !screenshot}
              className="flex-1"
            >
              Submit for Verification
            </Button>
          </div>
        </div>
      )}

      {stage === 'pending' && (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--teal-pale)]/50 flex items-center justify-center">
            <Clock size={28} className="text-[var(--forest)]" />
          </div>
          <div>
            <h3 className="font-display text-[22px] font-light text-[var(--charcoal)] mb-2">Payment Under Verification</h3>
            <p className="text-[13px] text-[var(--grey)] leading-relaxed max-w-sm">
              Our team is verifying your payment. Your project will start within <strong className="text-[var(--forest)]">2 hours</strong> of confirmation.
            </p>
          </div>
          <div className="w-full bg-[var(--teal-pale)]/30 border border-[var(--line)] p-4 text-left">
            <p className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] mb-2">What happens next</p>
            {['Payment verified by our team', 'Order status updated to Active', 'Seller begins your project', 'You receive updates at each milestone'].map((step, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[var(--line)] last:border-0">
                <div className="w-4 h-4 rounded-full border border-[var(--forest)] flex items-center justify-center text-[8px] text-[var(--forest)] font-medium">{i+1}</div>
                <span className="text-[12px] text-[var(--grey)]">{step}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleConfirm} size="lg" className="w-full">Go to My Orders →</Button>
        </div>
      )}
    </Modal>
  )
}
