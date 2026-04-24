export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound, serverError } from '@/lib/apiHelpers'
import { z } from 'zod'

const VerifySchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(), // Required when rejecting
})

// ── PATCH /api/payments/[id]/verify ──────────────────────────────────────
// Admin only: approve or reject a pending UPI payment
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session)              return unauthorized()
    if (session.role !== 'ADMIN') return forbidden()

    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    })

    if (!payment)                     return notFound('Payment')
    if (payment.status !== 'PENDING') return err('Payment has already been reviewed', 400)

    const body   = await req.json()
    const parsed = VerifySchema.safeParse(body)
    if (!parsed.success) return err('Invalid action', 422)

    const { action } = parsed.data

    if (action === 'approve') {
      // Approve payment → mark payment verified → move order to REQUIREMENTS_PENDING
      const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
          where: { id },
          data:  { status: 'VERIFIED', verifiedAt: new Date() },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data:  { status: 'REQUIREMENTS_PENDING' },
        }),
      ])
      return ok({ payment: updatedPayment, message: 'Payment approved. Order is now active.' })
    }

    if (action === 'reject') {
      // Reject → mark payment rejected → revert order to PENDING_PAYMENT
      const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
          where: { id },
          data:  { status: 'REJECTED' },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data:  { status: 'PENDING_PAYMENT' },
        }),
      ])
      return ok({ payment: updatedPayment, message: 'Payment rejected. Buyer notified.' })
    }

    return err('Unknown action', 400)
  } catch (e) {
    return serverError(e)
  }
}
