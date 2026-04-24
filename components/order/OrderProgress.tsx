import { Check } from 'lucide-react'
import { OrderStatus } from '@/types'

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'REQUIREMENTS_PENDING', label: 'Requirements' },
  { key: 'IN_PROGRESS',          label: 'In Progress' },
  { key: 'IN_REVIEW',            label: 'Review' },
  { key: 'DELIVERED',            label: 'Delivered' },
  { key: 'COMPLETED',            label: 'Completed' },
]

const ORDER_INDEX: Record<string, number> = {
  PENDING_PAYMENT:      -1,
  PAYMENT_VERIFICATION: -1,
  REQUIREMENTS_PENDING:  0,
  IN_PROGRESS:           1,
  IN_REVIEW:             2,
  DELIVERED:             3,
  COMPLETED:             4,
}

export default function OrderProgress({ status }: { status: OrderStatus }) {
  const currentIdx = ORDER_INDEX[status] ?? 0

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const done    = i <= currentIdx
        const current = i === currentIdx
        const last    = i === STEPS.length - 1

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center border text-[10px] transition-all
                ${done
                  ? 'bg-[var(--forest)] border-[var(--forest)] text-white'
                  : 'bg-[var(--paper)] border-[var(--line)] text-[var(--grey-light)]'}
                ${current ? 'ring-2 ring-[var(--forest)]/20 ring-offset-1' : ''}
              `}>
                {done && i < currentIdx
                  ? <Check size={12} strokeWidth={2.5} />
                  : <span>{i + 1}</span>
                }
              </div>
              <span className={`text-[9px] uppercase tracking-[1px] whitespace-nowrap ${done ? 'text-[var(--forest)]' : 'text-[var(--grey-light)]'}`}>
                {step.label}
              </span>
            </div>
            {!last && (
              <div className={`h-[1px] flex-1 -mt-4 mx-1 transition-all ${i < currentIdx ? 'bg-[var(--forest)]' : 'bg-[var(--line)]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
