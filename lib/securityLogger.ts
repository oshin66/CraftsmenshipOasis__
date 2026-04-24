export type SecurityEventType =
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PAYMENT_SUBMISSION'
  | 'PAYMENT_VERIFIED'
  | 'ADMIN_ACTION'
  | 'JWT_INVALID'
  | 'SERVER_ERROR'
  | 'UNAUTHORIZED_ACCESS'
  | 'REGISTRATION_SUCCESS'

interface LogPayload {
  event: SecurityEventType
  message: string
  ip?: string
  userId?: string
  email?: string
  endpoint?: string
  targetId?: string
  action?: string
  txnId?: string
  error?: string
  userAgent?: string
}

export async function securityLog(payload: LogPayload) {
  const sanitizeForLog = {
    ...payload,
    timestamp: new Date().toISOString(),
  }
  
  if (sanitizeForLog.email) {
    const split = sanitizeForLog.email.split('@')
    if (split.length === 2 && split[0].length > 2) {
      sanitizeForLog.email = `${split[0].substring(0, 2)}***@${split[1]}`
    }
  }

  // Next.js structured logging for Vercel
  console.log(JSON.stringify(sanitizeForLog))
}
