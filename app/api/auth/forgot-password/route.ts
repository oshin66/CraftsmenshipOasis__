import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err, serverError } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ForgotPasswordSchema.safeParse(body)
    if (!parsed.success) return err('Invalid email', 422)

    const { email } = parsed.data

    // Rate Limiting
    const ip = await extractIp()
    const limiter = await rateLimit('login', ip, req.nextUrl.pathname)
    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // For security reasons, don't reveal if user exists or not
      return ok({ message: 'If an account with that email exists, we have sent a reset link.' })
    }

    // Generate token
    const token = randomUUID().replace(/-/g, '')
    
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    // MOCK EMAIL SENDING
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    
    console.log(`\n\n-----------------------------------------`)
    console.log(`MOCK PASSWORD RESET EMAIL SENT TO: ${email}`)
    console.log(`RESET URL: ${resetUrl}`)
    console.log(`-----------------------------------------\n\n`)

    return ok({ message: 'If an account with that email exists, we have sent a reset link.' })
  } catch (e) {
    console.error('[Forgot Password Error]', e)
    return serverError('Failed to process forgot password request')
  }
}
