export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, serverError, tooManyRequests } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { sanitizeText } from '@/lib/sanitize'
import { z } from 'zod'

const CreateOrderSchema = z.object({
  gigId:   z.string().cuid(),
  package: z.enum(['basic', 'standard', 'premium']),
}).strict()

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const ip = await extractIp()
    const limiterKey = `${ip}:${session.userId}`
    const rl = await rateLimit('orders', limiterKey, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    const body = await req.json().catch(() => null)
    if (!body) return err('Invalid request body', 400)

    const parsed = CreateOrderSchema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0].message, 422)

    const data = parsed.data

    const gig = await prisma.gig.findUnique({
      where: { id: data.gigId },
      select: { 
        id: true, status: true, sellerId: true, 
        basicPrice: true, standardPrice: true, premiumPrice: true 
      }
    })

    if (!gig) return err('Gig not found', 404)
    if (gig.status !== 'PUBLISHED') return err('Gig is not available for order', 400)
    if (gig.sellerId === session.userId && session.role !== 'ADMIN') {
      return err('You cannot order your own gig', 403) // Anti-fraud
    }

    let price = 0
    if (data.package === 'basic') price = gig.basicPrice
    else if (data.package === 'standard') price = gig.standardPrice
    else price = gig.premiumPrice

    // State machine strictly starts at PENDING_PAYMENT
    const order = await prisma.order.create({
      data: {
        package: data.package,
        price,
        status: 'PENDING_PAYMENT',
        gigId: gig.id,
        buyerId: session.userId,
        sellerId: gig.sellerId,
      }
    })

    // Increment gig order count contextually
    await prisma.gig.update({
      where: { id: gig.id },
      data: { totalOrders: { increment: 1 } }
    })

    return ok({ order }, 201)
  } catch (e) {
    console.error(e)
    return serverError('Failed to create order')
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const ip = await extractIp()
    const rl = await rateLimit('global', ip, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    // Ensure users can uniquely fetch ONLY deals they are attached to
    const asSeller = req.nextUrl.searchParams.get('asSeller') === 'true'

    const where: any = {}
    if (asSeller) {
      if (session.role !== 'SELLER' && session.role !== 'ADMIN') return err('Forbidden', 403)
      where.sellerId = session.userId
    } else {
      where.buyerId = session.userId
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        gig: { select: { title: true, thumbnail: true } },
        buyer: { select: { name: true, avatar: true } },
        seller: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Hard pagination cap
    })

    return ok({ orders })
  } catch (e) {
    console.error(e)
    return serverError('Failed to fetch orders')
  }
}
