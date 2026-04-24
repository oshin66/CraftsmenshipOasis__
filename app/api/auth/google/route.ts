export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // Use localhost in dev, or the production URL from env
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/google/callback`
  const clientId = process.env.GOOGLE_CLIENT_ID
  
  if (!clientId) {
    return NextResponse.json({ error: 'Missing GOOGLE_CLIENT_ID configuration' }, { status: 500 })
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('access_type', 'online')
  authUrl.searchParams.set('prompt', 'select_account')

  return NextResponse.redirect(authUrl.toString())
}
