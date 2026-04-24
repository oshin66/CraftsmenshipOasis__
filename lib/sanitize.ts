// We'll use DOMPurify/xss concepts. Next doesn't have an implicit safe one server side by default, so we'll install xss later. For now, we manually escape.
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return ''
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
}

export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return ''
  // Very crude manual regex fallback if library not available.
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/on\w+="[^"]*"/gi, '')
             .replace(/javascript:/gi, '')
}

export function sanitizeTransactionId(txnId: string | undefined | null): string {
  if (!txnId) return ''
  return txnId.replace(/[^A-Za-z0-9]/g, '').slice(0, 50).toUpperCase()
}

export function sanitizeObject<T extends object>(obj: T): T {
  if (!obj) return obj
  const out: any = Array.isArray(obj) ? [] : {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    if (typeof value === 'string') {
      out[key] = sanitizeText(value)
    } else if (typeof value === 'object' && value !== null) {
      out[key] = sanitizeObject(value)
    } else {
      out[key] = value
    }
  }
  return out as T
}
