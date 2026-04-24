export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, setSessionCookie, hashPassword } from '@/lib/auth'
import { ok, err, serverError, tooManyRequests } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { securityLog } from '@/lib/securityLogger'
import { z } from 'zod'

const LoginSchema = z.object({
  email:    z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(8).max(128).trim(), // Security limit
}).strict() // No extra fields allowed

export async function POST(req: NextRequest) {
  try {
    const ip = await extractIp()

    // 1. Rate Limit
    const rl = await rateLimit('login', ip, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    // 2. Parse Body safely
    const body = await req.json().catch(() => null)
    if (!body) return err('Invalid request body', 400)

    // 3. Validation
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) return err('Invalid email or password', 422)

    const { email, password } = parsed.data

    // 4. Fetch User
    const user = await prisma.user.findUnique({ where: { email } })

    // Check account lockout
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      await securityLog({ event: 'LOGIN_FAILED', message: 'Account locked', email, ip, userAgent: req.headers.get('user-agent') || '' })
      // Even if locked, we return generic to not expose user existence if possible, 
      // but for locked accounts it's generally fine to say it's locked, though strict generic is "Invalid email or password"
      // Per prompt: NEVER distinguish.
      return err('Invalid email or password', 401)
    }

    // 5. Verification (Timing Attack Prevention)
    // If user doesn't exist, we hash the password anyway against a dummy hash to take the exact same amount of time.
    const DUMMY_HASH = '1ea89254d19d6517a1f592be1620a16b:1ea89254d19d6517a1f592be1620a16b1ea89254d19d6517a1f592be1620a16b'
    const targetHash = user ? user.password : DUMMY_HASH
    const valid = await verifyPassword(password, targetHash)

    if (!user || !valid) {
      if (user) {
        // Increment failed attempts
        const newFails = user.failedAttempts + 1
        let lockedTime = null
        if (newFails >= 10) {
          lockedTime = new Date(Date.now() + 15 * 60000) // Lock for 15 mins
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: newFails, lockedUntil: lockedTime }
        })
      }
      await securityLog({ event: 'LOGIN_FAILED', message: 'Invalid credentials', email, ip, userAgent: req.headers.get('user-agent') || '' })
      return err('Invalid email or password', 401)
    }

    // 6. Success Reset
    if (user.failedAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null }
      })
    }

    // 7. Sign Session
    const token = await signToken({
      userId:         user.id,
      email:          user.email,
      role:           user.role,
      isSeller:       user.isSeller,
      sessionVersion: user.sessionVersion,
    })

    await securityLog({ event: 'LOGIN_SUCCESS', message: 'User logged in', userId: user.id, email, ip })

    const response = ok({
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, isSeller: user.isSeller } },
    })
    response.cookies.set(setSessionCookie(token))
    return response

  } catch (e) {
    console.error(e)
    return serverError('Authentication failed')
  }
}
