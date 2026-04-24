import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-at-least-64-characters-long-required-in-production-env'
const JWT_SECRET = new TextEncoder().encode(NEXTAUTH_SECRET)

// Security bounds
const ADMIN_PATHS = ['/admin', '/api/admin']
const SELLER_PATHS = ['/dashboard/seller']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path))
  const isSellerPath = SELLER_PATHS.some(path => pathname.startsWith(path))
  
  if (!isAdminPath && !isSellerPath) return NextResponse.next()

  const token = req.cookies.get('co_session')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'craftsmanship-oasis',
      audience: 'craftsmanship-oasis-app',
    })

    const role = payload.role as string

    if (isAdminPath && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (isSellerPath && role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/buyer', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    const response = NextResponse.redirect(new URL('/auth/login', req.url))
    response.cookies.delete('co_session')
    return response
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/dashboard/seller/:path*'],
}
