
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
  
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: "GitHub Client ID not found" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const callbackUrl = searchParams.get('callbackUrl') || ''

  // Ideally we should state param to prevent CSRF and pass callbackUrl
  // For simplicity MVP:
  const redirectUri = `${new URL(request.url).origin}/api/auth/github/callback`
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "user:email",
  })

  // redirect(url) from next/navigation is for Server Components mostly, here we return redirect response
  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
}
