
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

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "GitHub credentials not configured" }, { status: 500 })
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
       throw new Error(tokenData.error_description || "Failed to get access token")
    }

    const accessToken = tokenData.access_token

    // 2. Fetch User Profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const userData = await userResponse.json()

    // 3. Fetch User Emails (if email is private)
    let email = userData.email
    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const emails = await emailsResponse.json()
      // Find primary verified email
      const primaryEmail = emails.find((e: any) => e.primary && e.verified)
      if (primaryEmail) email = primaryEmail.email
    }

    if (!email) {
      return NextResponse.json({ error: "No verified email found from GitHub" }, { status: 400 })
    }

    // 4. Link or Register User
    const appUser = await linkOrRegisterSocialUser({
      provider: "github",
      providerId: userData.id.toString(),
      email: email,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
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
    console.error("GitHub Auth Error:", error)
    return NextResponse.redirect(`${origin}/login?error=GithubAuthFailed`)
  }
}
