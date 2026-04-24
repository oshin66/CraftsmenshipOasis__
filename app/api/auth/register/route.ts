export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ok, err, serverError, tooManyRequests } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { securityLog } from '@/lib/securityLogger'
import { sanitizeText } from '@/lib/sanitize'
import { z } from 'zod'

const DISPOSABLE_DOMAINS = ['tempmail.com', '10minutemail.com', 'throwawaymail.com'] // Expanded in production

const RegisterSchema = z.object({
  name:      z.string().min(2).max(100).trim(),
  email:     z.string().email().max(255).trim().toLowerCase(),
  password:  z.string().min(8).max(128).trim().regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  isSeller:  z.boolean().default(false),
  bio:       z.string().max(1000).trim().optional(),
  skills:    z.string().max(500).trim().optional(),
  paymentQr: z.string().optional(),
  otp:       z.string().length(6).optional(),
}).strict()

export async function POST(req: NextRequest) {
  try {
    const ip = await extractIp()

    const rl = await rateLimit('register', ip, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    const body = await req.json().catch(() => null)
    if (!body) return err('Invalid request body', 400)

    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0].message, 422)

    const { name, email, password, isSeller, bio, skills, paymentQr, otp } = parsed.data

    const domain = email.split('@')[1]
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return err('Disposable email addresses are not allowed', 400)
    }

    if (password.toLowerCase().includes(name.toLowerCase().split(' ')[0]) || password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      return err('Password cannot contain your name or email', 400)
    }

    const verification = await prisma.otpVerification.findUnique({ where: { email } })
    if (!verification || verification.otp !== otp || verification.expiresAt < new Date()) {
      return err('Invalid or expired OTP', 400)
    }

    let hashedPassword = ''
    try {
      hashedPassword = await hashPassword(password)
    } catch (e: any) {
      return err(e.message, 400)
    }

    // Generic response if email exists to stop enumeration (though OTP protects this route anyway, it's safe to throw err if it exists since OTP verified ownership)
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return err('User already exists', 400) 
    }

    const safeName   = sanitizeText(name)
    const safeBio    = sanitizeText(bio)
    const safeSkills = sanitizeText(skills)

    const user = await prisma.user.create({
      data: {
        name: safeName,
        email,
        password: hashedPassword,
        isSeller,
        role: isSeller ? 'SELLER' : 'BUYER',
        sellerBio: safeBio || null,
        skills: safeSkills || null,
        paymentQr: paymentQr || null,
      }
    })

    await prisma.otpVerification.delete({ where: { email } })

    await securityLog({ event: 'REGISTRATION_SUCCESS', message: 'User registered', userId: user.id, email, ip })

    return ok({ message: 'Registration successful' }, 201)

  } catch (e) {
    console.error(e)
    return serverError('Registration failed')
  }
}
