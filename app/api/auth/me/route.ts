export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/apiHelpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    // Enforce session versioning (protects against stolen tokens if user rotated session)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, name: true, email: true, role: true, isSeller: true, sessionVersion: true
      }
    })

    if (!user) return unauthorized('User no longer exists')
    if (session.sessionVersion !== undefined && user.sessionVersion !== session.sessionVersion) {
      return unauthorized('Session has been revoked')
    }

    return ok({ data: { user } })
  } catch (e) {
    console.error(e)
    return serverError('Failed to retrieve session')
  }
}
