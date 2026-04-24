export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound, serverError, tooManyRequests } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { securityLog } from '@/lib/securityLogger'

// ── GET /api/gigs/[id] ────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = await extractIp()
    const rl = await rateLimit('gigsGet', ip, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    const { id } = await params
    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, avatar: true, sellerBio: true, skills: true } },
      },
    })

    if (!gig) return notFound('Gig')
    
    // Visibility Check (Layer 4)
    if (gig.status !== 'PUBLISHED') {
      const session = await getSession()
      const isOwner = session?.userId === gig.sellerId
      const isAdmin = session?.role === 'ADMIN'
      
      if (!isOwner && !isAdmin) {
        return notFound('Gig') // Security: generic 404 obscure existence
      }
    }
    
    return ok({ gig })
  } catch (e) {
    console.error(e)
    return serverError('Failed to retrieve gig')
  }
}

// ── DELETE /api/gigs/[id] ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const ip = await extractIp()
    const limiterKey = `${ip}:${session.userId}`
    
    const rl = await rateLimit('gigs', limiterKey, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    if (!['ADMIN', 'SELLER'].includes(session.role)) return forbidden()

    const { id } = await params
    const gig = await prisma.gig.findUnique({
      where: { id },
      select: { sellerId: true, status: true }
    })

    if (!gig) return notFound('Gig')

    if (gig.sellerId !== session.userId && session.role !== 'ADMIN') {
      await securityLog({ event: 'UNAUTHORIZED_ACCESS', message: 'Attempt to delete unowned gig', userId: session.userId, targetId: id, ip })
      return forbidden()
    }

    const orderCount = await prisma.order.count({ where: { gigId: id } })

    if (orderCount > 0) {
      await prisma.gig.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      })
      await securityLog({ event: 'ADMIN_ACTION', action: 'GIG_ARCHIVED', userId: session.userId, targetId: id, ip, message: 'Safely archived' })
      return ok({ message: 'Gig has associated orders and has been safely archived.' })
    }

    await prisma.gig.delete({ where: { id } })
    await securityLog({ event: 'ADMIN_ACTION', action: 'GIG_DELETED', userId: session.userId, targetId: id, ip, message: 'Hard deleted' })

    return ok({ message: 'Gig deleted successfully' })
  } catch (e) {
    console.error(e)
    return serverError('Failed to delete gig')
  }
}
