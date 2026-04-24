export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  // Clear the secure JWT cookie
  response.cookies.set(clearSessionCookie())
  return response
}
