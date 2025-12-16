
import { NextResponse } from "next/server"
import { linkOrRegisterSocialUser } from "@/lib/social-auth"
import { login } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google credentials not configured" }, { status: 500 })
  }

  const redirectUri = `${origin}/api/auth/google/callback`

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
       throw new Error(tokenData.error_description || "Failed to get access token")
    }

    const accessToken = tokenData.access_token

    // 2. Fetch User Profile
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const userData = await userResponse.json()

    // 3. Link or Register User
    const appUser = await linkOrRegisterSocialUser({
      provider: "google",
      providerId: userData.sub,
      email: userData.email,
      name: userData.name,
      avatarUrl: userData.picture,
      data: userData,
    })

    // 5. Login (Set Cookie)
    await login({
        id: appUser.id,
        email: appUser.email,
        role: appUser.role
    })

    // 6. Redirect to Dashboard
    return NextResponse.redirect(`${origin}/dashboard`)

  } catch (error) {
    console.error("Google Auth Error:", error)
    return NextResponse.redirect(`${origin}/login?error=GoogleAuthFailed`)
  }
}
