export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err, serverError } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { z } from 'zod'
import { NextResponse } from 'next/server'

const SendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SendOtpSchema.safeParse(body)
    if (!parsed.success) return err('Invalid email', 422)

    const { email } = parsed.data

    // Layer 2: Rate Limiting (5 per minute for auth)
    const ip = await extractIp()
    const limiter = await rateLimit('login', ip, req.nextUrl.pathname)
    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } }
      )
    }

    // Check duplicate email
    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return err('An account with this email already exists.', 409)
    } catch (e: any) {
      console.error('[DB Error during duplicate check]', e.message)
      if (e.message.includes('Can\'t reach database server')) {
        return err('Unable to connect to database. Please check your network or TiDB allowlist.', 503)
      }
      throw e // Let the outer catch handle other unexpected errors
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in DB
    try {
      await prisma.otpVerification.upsert({
        where: { email },
        update: { otp, expiresAt },
        create: { email, otp, expiresAt },
      })
    } catch (e: any) {
      console.error('[DB Error during OTP save]', e.message)
      // If the table doesn't exist yet or connection lost, we log it and proceed for demo purposes if needed
      // but ideally we want it to fail so the user knows verification won't work.
      return err('Critical: Could not prepare verification. Please try again in a moment.', 500)
    }

    // MOCK EMAIL SENDING
    console.log(`\n\n-----------------------------------------`)
    console.log(`MOCK EMAIL SENT TO: ${email}`)
    console.log(`VERIFICATION OTP: ${otp}`)
    console.log(`-----------------------------------------\n\n`)

    return ok({ message: 'OTP sent successfully' })
  } catch (e) {
    console.error('[Unexpected OTP Error]', e)
    return serverError('Failed to process OTP request')
  }
}
