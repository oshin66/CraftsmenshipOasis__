import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, serverError } from '@/lib/apiHelpers'
import { z } from 'zod'

const ReviewSchema = z.object({
  orderId: z.string(),
  rating:  z.number().int().min(1).max(5),
  comment: z.string().min(5),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body   = await req.json()
    const parsed = ReviewSchema.safeParse(body)
    if (!parsed.success) return err('Invalid review data', 422)

    const { orderId, rating, comment } = parsed.data

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { gig: true }
    })

    if (!order) return err('Order not found', 404)
    if (order.buyerId !== session.userId) return forbidden()
    if (order.status !== 'COMPLETED') return err('Review can only be left on completed orders', 400)

    const existingReview = await prisma.review.findUnique({
      where: { orderId }
    })
    if (existingReview) return err('Review already exists for this order', 400)

    const [review] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const r = await tx.review.create({
        data: {
          rating,
          comment,
          orderId,
          gigId: order.gigId,
          authorId: session.userId,
        }
      })

      // Update gig rating (average)
      const reviews = await tx.review.findMany({
        where: { gigId: order.gigId },
        select: { rating: true }
      })
      const avg = reviews.reduce((s, x) => s + x.rating, 0) / reviews.length

      await tx.gig.update({
        where: { id: order.gigId },
        data: { rating: avg }
      })

      return [r]
    })

    return ok({ review }, 201)
  } catch (e) {
    return serverError(e)
  }
}
