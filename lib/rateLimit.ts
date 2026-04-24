import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'
import { securityLog } from './securityLogger'

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

export const LIMITS = {
  login:    { max: 5,   window: '1 m' as const },
  register: { max: 3,   window: '1 h' as const },
  payments: { max: 3,   window: '5 m' as const },
  gigs:     { max: 10,  window: '1 h' as const },
  orders:   { max: 20,  window: '1 h' as const },
  gigsGet:  { max: 100, window: '1 m' as const },
  admin:    { max: 30,  window: '1 m' as const },
  global:   { max: 200, window: '1 m' as const },
}

const limiters: Record<string, Ratelimit | null> = {}

if (redis) {
  for (const [key, config] of Object.entries(LIMITS)) {
    limiters[key] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.max, config.window),
      analytics: true
    })
  }
}

const memoryStore = new Map<string, { count: number; expiresAt: number }>()

function getWindowSeconds(w: string) {
  const parts = w.split(' ')
  const n = parseInt(parts[0])
  if (parts[1] === 'm') return n * 60
  if (parts[1] === 'h') return n * 3600
  return n
}

export async function rateLimit(type: keyof typeof LIMITS, identifier: string, reqPath: string = 'api') {
  const cacheKey = `ratelimit:${type}:${identifier}`
  let ok = true
  let limit = LIMITS[type].max
  let remaining = limit
  let reset = Date.now() + 60000

  if (redis && limiters[type]) {
    const res = await limiters[type]!.limit(cacheKey)
    ok = res.success
    limit = res.limit
    remaining = res.remaining
    reset = res.reset
  } else {
    const now = Date.now()
    const sec = getWindowSeconds(LIMITS[type].window)
    let record = memoryStore.get(cacheKey)
    if (!record || record.expiresAt < now) {
      record = { count: 0, expiresAt: now + (sec * 1000) }
    }
    record.count++
    memoryStore.set(cacheKey, record)
    ok = record.count <= LIMITS[type].max
    remaining = Math.max(0, LIMITS[type].max - record.count)
    reset = record.expiresAt
  }

  if (!ok) {
    securityLog({
      event: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit hit for ${type}`,
      ip: identifier,
      endpoint: reqPath
    }).catch(() => {})
  }

  return {
    allowed: ok,
    limit,
    remaining,
    resetAt: reset,
    retryAfter: Math.ceil((reset - Date.now()) / 1000)
  }
}

export async function extractIp() {
  try {
    const hdrs = await headers()
    const forwarded = hdrs.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0].trim()
    const realIP = hdrs.get('x-real-ip')
    if (realIP) return realIP
  } catch {}
  return '127.0.0.1'
}
