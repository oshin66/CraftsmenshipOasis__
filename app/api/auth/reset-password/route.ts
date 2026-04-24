import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ok, err, serverError } from '@/lib/apiHelpers'
import { z } from 'zod'

const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ResetPasswordSchema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0].message, 422)

    const { token, password } = parsed.data

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return err('Invalid or expired reset token', 400)
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return ok({ message: 'Password has been reset successfully' })
  } catch (e) {
    console.error('[Reset Password Error]', e)
    return serverError('Failed to reset password')
  }
}
