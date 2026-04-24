export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { signToken, setSessionCookie, hashPassword } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=NoCode', req.url))
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/google/callback`
  
  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
    })
    
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('Google Token Error:', tokenData)
      throw new Error(tokenData.error_description || 'Failed to get token')
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()
    if (!userRes.ok) {
      console.error('Google UserInfo Error:', userData)
      throw new Error('Failed to get user info')
    }

    const email = userData.email.toLowerCase()
    
    // 3. Find or Create User in Oasis Database
    let user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      // By default, Google sign-ups are buyers. They can upgrade later if needed.
      // Generate a long random password since they use Google to log in
      const crypto = require('crypto')
      const randomPassword = crypto.randomBytes(32).toString('hex')
      const hashedPassword = await hashPassword(randomPassword)

      user = await prisma.user.create({
        data: {
          name: userData.name || email.split('@')[0],
          email,
          password: hashedPassword,
          role: 'BUYER',
          isSeller: false,
          avatar: userData.picture || null,
        }
      })
    }

    // 4. Create Session Token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller,
      sessionVersion: user.sessionVersion,
    })

    // 5. Redirect based on user role
    const dest = 
      user.role === 'ADMIN' ? '/admin' :
      user.role === 'SELLER' ? '/dashboard/seller' : 
      '/dashboard/buyer'
      
    // Set our custom session cookie via next/headers robust method
    const cookieStore = await cookies()
    const opts = setSessionCookie(token)
    cookieStore.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    })

    return NextResponse.redirect(new URL(dest, req.url))

  } catch (error: any) {
    console.error('[Google OAuth Callback Error]', error)
    // append to scratch debug log
    try {
      require('fs').appendFileSync('scratch/auth_debug.log', new Date().toISOString() + ' ' + (error?.message || error) + '\n')
    } catch(e) {}
    
    return NextResponse.redirect(new URL('/auth/login?error=GoogleAuthFailed', req.url))
  }
}

