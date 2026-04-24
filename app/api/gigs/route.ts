export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, serverError, tooManyRequests } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { sanitizeText } from '@/lib/sanitize'
import { z } from 'zod'

const CreateGigSchema = z.object({
  title:           z.string().min(5).max(100).trim(),
  description:     z.string().min(20).max(5000).trim(),
  category:        z.string().min(2).max(50).trim(),
  techStack:       z.string().max(300).trim(),
  thumbnail:       z.string().nullable().optional(),
  demoUrl:         z.string().nullable().optional(),
  freeDownloadUrl: z.string().nullable().optional(),
  basicPrice:      z.number().int().min(0).max(1000000),
  basicDesc:       z.string().max(1000).trim(),
  standardPrice:   z.number().int().min(0).max(1000000),
  standardDesc:    z.string().max(1000).trim(),
  premiumPrice:    z.number().int().min(0).max(1000000),
  premiumDesc:     z.string().max(1000).trim(),
  deliveryDays:    z.number().int().min(1).max(90)
}).strict()

export async function GET(req: NextRequest) {
  try {
    const ip = await extractIp()
    const rl = await rateLimit('gigsGet', ip, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    const url = new URL(req.url)
    const cat = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const sellerId = url.searchParams.get('sellerId')

    const where: any = { status: 'PUBLISHED' }
    if (cat) where.category = cat
    if (sellerId) where.sellerId = sellerId
    if (search) {
      const safeSearch = sanitizeText(search)
      where.OR = [
        { title: { contains: safeSearch } },
        { description: { contains: safeSearch } }
      ]
    }

    const gigs = await prisma.gig.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit output to prevent memory exhaustion
    })

    return ok({ gigs })
  } catch (e) {
    console.error(e)
    return serverError('Failed to fetch gigs')
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const ip = await extractIp()
    const limiterKey = `${ip}:${session.userId}`
    const rl = await rateLimit('gigs', limiterKey, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    if (session.role !== 'SELLER' && session.role !== 'ADMIN') return forbidden()

    if (!session.isSeller) return forbidden('You must complete your seller registration to post gigs.')

    const body = await req.json().catch(() => null)
    if (!body) return err('Invalid request body', 400)

    const parsed = CreateGigSchema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0].message, 422)

    const data = parsed.data

    const totalUserGigs = await prisma.gig.count({
      where: { sellerId: session.userId, status: { not: 'ARCHIVED' } }
    })

    if (totalUserGigs >= 10 && session.role !== 'ADMIN') {
      return err('Maximum active gigs reached (10). Archive some gigs to create new ones.', 403)
    }

    // Safety constraint validation
    if (data.basicPrice > data.standardPrice || data.standardPrice > data.premiumPrice) {
      if (data.standardPrice !== 0 && data.premiumPrice !== 0) {
        return err('Pricing tiers must be incremental (Basic <= Standard <= Premium).', 400)
      }
    }

    const gig = await prisma.gig.create({
      data: {
        title: sanitizeText(data.title),
        description: sanitizeText(data.description),
        category: sanitizeText(data.category),
        techStack: sanitizeText(data.techStack),
        thumbnail: data.thumbnail,
        demoUrl: data.demoUrl,
        freeDownloadUrl: data.freeDownloadUrl,
        basicPrice: data.basicPrice,
        basicDesc: sanitizeText(data.basicDesc),
        standardPrice: data.standardPrice,
        standardDesc: sanitizeText(data.standardDesc),
        premiumPrice: data.premiumPrice,
        premiumDesc: sanitizeText(data.premiumDesc),
        deliveryDays: data.deliveryDays,
        status: 'PENDING_REVIEW', // Cannot manually set to PUBLISHED here
        sellerId: session.userId,
      }
    })

    return ok({ gig }, 201)
  } catch (e) {
    console.error(e)
    return serverError('Failed to create gig')
  }
}
