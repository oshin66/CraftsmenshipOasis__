import { NextResponse } from 'next/server'

export function ok(data: any = { success: true }, status = 200) {
  const payload = (typeof data === 'object' && data !== null && !Array.isArray(data)) 
    ? { success: true, ...data } 
    : data;
  return NextResponse.json(payload, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'Forbidden: Access Denied') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFound(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function tooManyRequests(retryAfter = 60) {
  return NextResponse.json(
    { error: 'Too many requests', retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

export function serverError(message = 'Internal Server Error') {
  return NextResponse.json({ error: message }, { status: 500 })
}
