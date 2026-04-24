export const dynamic = "force-dynamic"
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, forbidden, unauthorized, serverError } from '@/lib/apiHelpers'

// GET /api/users — admin only: list all users
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role !== 'ADMIN') return forbidden()

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isSeller: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return ok({ users })
  } catch (e) {
    return serverError(e)
  }
}
