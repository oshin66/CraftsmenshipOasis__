export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound, serverError } from '@/lib/apiHelpers'
import { z } from 'zod'

const ORDER_INCLUDE = {
  gig:    { include: { seller: { select: { id: true, name: true, avatar: true } } } },
  buyer:  { select: { id: true, name: true, email: true, avatar: true } },
  seller: { select: { id: true, name: true, email: true, avatar: true } },
  payment: true,
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE })
    if (!order) return notFound('Order')

    const canView = session.role === 'ADMIN'
      || order.buyerId  === session.userId
      || order.sellerId === session.userId

    if (!canView) return forbidden()

    return ok({ order })
  } catch (e) {
    return serverError(e)
  }
}

const PatchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('submit_requirements'), requirements: z.string().min(10) }),
  z.object({ action: z.literal('deliver'), deliveryFile: z.string().min(1) }),
  z.object({ action: z.literal('request_revision') }),
  z.object({ action: z.literal('complete') }),
])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return notFound('Order')

    const body   = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) return err('Invalid action', 422)

    const { action } = parsed.data

    // ── submit_requirements (buyer only) ───────────────────────────────
    if (action === 'submit_requirements') {
      if (order.buyerId !== session.userId) return forbidden()
      if (order.status  !== 'REQUIREMENTS_PENDING') return err('Order is not awaiting requirements', 400)
      const updated = await prisma.order.update({
        where: { id },
        data:  { requirements: parsed.data.requirements, status: 'IN_PROGRESS' },
        include: ORDER_INCLUDE,
      })
      return ok({ order: updated })
    }

    // ── deliver (seller only) ──────────────────────────────────────────
    if (action === 'deliver') {
      if (order.sellerId !== session.userId) return forbidden()
      if (!['IN_PROGRESS', 'IN_REVIEW'].includes(order.status)) return err('Cannot deliver at this stage', 400)
      const updated = await prisma.order.update({
        where: { id },
        data:  { deliveryFile: parsed.data.deliveryFile, status: 'DELIVERED' },
        include: ORDER_INCLUDE,
      })
      return ok({ order: updated })
    }

    // ── request_revision (buyer only) ─────────────────────────────────
    if (action === 'request_revision') {
      if (order.buyerId !== session.userId) return forbidden()
      if (order.status  !== 'DELIVERED')   return err('Can only request revision on delivered orders', 400)
      const updated = await prisma.order.update({
        where: { id }, data: { status: 'IN_REVIEW' }, include: ORDER_INCLUDE,
      })
      return ok({ order: updated })
    }

    // ── complete (buyer only) ─────────────────────────────────────────
    if (action === 'complete') {
      if (order.buyerId !== session.userId) return forbidden()
      if (order.status  !== 'DELIVERED')   return err('Can only complete a delivered order', 400)
      const [updated] = await prisma.$transaction([
        prisma.order.update({
          where: { id }, data: { status: 'COMPLETED' }, include: ORDER_INCLUDE,
        }),
        prisma.gig.update({
          where: { id: order.gigId },
          data:  { totalOrders: { increment: 1 } },
        }),
      ])
      return ok({ order: updated })
    }

    return err('Unknown action', 400)
  } catch (e) {
    return serverError(e)
  }
}
