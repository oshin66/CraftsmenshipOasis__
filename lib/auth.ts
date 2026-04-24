import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// SECURITY: Secret must be 64+ characters (512 bits) in production
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-at-least-64-characters-long-required-in-production-env'
const JWT_SECRET = new TextEncoder().encode(NEXTAUTH_SECRET)

// SECURITY: Pinning HS256 ONLY
const JWT_CONFIG = {
  alg: 'HS256' as const,
  issuer: 'craftsmanship-oasis',
  audience: 'craftsmanship-oasis-app',
  expiresIn: '15m', // Short-lived access token
}

export interface SessionPayload extends JWTPayload {
  userId: string
  email: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  isSeller: boolean
  sessionVersion?: number
}

// Prevents users from using easily guessable passwords (OWASP A07)
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'shadow',
  '123123', '654321', 'superman', 'qazwsx', 'michael', 'football',
  'password1', 'password1234', 'welcome', 'welcome1', 'admin', 'admin123',
  'root', 'toor', 'pass', 'test', 'guest', 'master123', 'changeme',
])

export function timingSafeEqual(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    // If lengths are different, do a dummy comparison to prevent info leak.
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a))
    return false
  }
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8 || password.length > 128) throw new Error('Password length must be between 8 and 128 chars')
  if (COMMON_PASSWORDS.has(password.toLowerCase())) throw new Error('Password is too common')

  const salt = crypto.randomBytes(16).toString('hex')
  return new Promise((resolve, reject) => {
    // PBKDF2: 310,000 iterations, SHA-256 (OWASP 2024 minimum)
    crypto.pbkdf2(password, salt, 310000, 64, 'sha256', (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':')
  if (!salt || !key) return false
  
  return new Promise((resolve) => {
    crypto.pbkdf2(password, salt, 310000, 64, 'sha256', (err, derivedKey) => {
      if (err) resolve(false)
      resolve(timingSafeEqual(key, derivedKey.toString('hex')))
    })
  })
}

export async function signToken(payload: Omit<SessionPayload, 'exp' | 'iat'> & { sessionVersion?: number }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_CONFIG.alg })
    .setIssuedAt()
    .setIssuer(JWT_CONFIG.issuer)
    .setAudience(JWT_CONFIG.audience)
    .setExpirationTime(JWT_CONFIG.expiresIn)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Explicitly block alg: none
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    })
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('co_session')?.value
  if (!token) return null
  return verifyToken(token)
}

export function setSessionCookie(token: string) {
  return {
    name: 'co_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 15 * 60, // 15 mins
  }
}

export function clearSessionCookie() {
  return {
    name: 'co_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

export async function signRefreshToken(userId: string, sessionVersion: number): Promise<string> {
  return new SignJWT({ userId, sessionVersion })
    .setProtectedHeader({ alg: JWT_CONFIG.alg })
    .setIssuedAt()
    .setIssuer(JWT_CONFIG.issuer)
    .setAudience(JWT_CONFIG.audience)
    .setExpirationTime('7d') // Long-lived
    .sign(JWT_SECRET)
}

export function setRefreshTokenCookie(token: string) {
  return {
    name: 'co_refresh',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  }
}
