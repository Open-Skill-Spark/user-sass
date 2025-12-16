
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google Client ID not found" }, { status: 500 })
  }

  const redirectUri = `${new URL(request.url).origin}/api/auth/google/callback`
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline", // To get refresh token if needed, usually good practice
    prompt: "consent", // Force consent screen to ensure refresh token
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
