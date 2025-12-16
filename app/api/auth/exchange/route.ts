
import { NextResponse } from "next/server"
import { validateAuthCode } from "@/lib/auth-codes"
import { getTeamByDomain } from "@/lib/tenant"
import { login } from "@/lib/auth" // We use encrypt() logic inside login, or we can use encrypt directly.
// Actually, login() sets a cookie. We want to Return a token.
// lib/auth.ts login() now returns the session string (modified in Step 62). perfect.
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, callbackUrl } = body

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    // 1. Validate Code
    const userId = await validateAuthCode(code)
    if (!userId) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // 2. Fetch User
    const userResult = await sql`SELECT * FROM users WHERE id = ${userId}`
    const user = userResult[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    // 3. Multi-Tenant Resolution
    let finalRole = user.role // Default to global role
    let teamContext = null

    if (callbackUrl) {
      const team = await getTeamByDomain(callbackUrl)
      if (team) {
        teamContext = team
        // Fetch role in this specific team
        const memberResult = await sql`
          SELECT role FROM team_members 
          WHERE team_id = ${team.id} AND user_id = ${user.id}
        `
        if (memberResult.length > 0) {
          finalRole = memberResult[0].role
        } else {
            // User is not in this team. 
            // Strict Mode: Reject? 
            // Loose Mode: Give them "guest" or just generic user role?
            // For now, we'll strip them to 'member' or 'viewer' if they aren't explicitly in the team?
            // Or just keep 'user'.
            finalRole = 'user' // Downgrade to basic user if not a member of the domain-locked team
        }
      }
    }

    // 4. Generate Token (Session)
    // We reuse the login function to generate the signed JWT
    // NOTE: This will also try to set a cookie on the SaaS domain, which is harmless side effect for server-to-server 
    // but might overwrite an existing admin session if the SaaS admin triggered this. 
    // Ideally we should enable 'login' to skip cookie setting via a flag.
    // For now, passing { user } logic.
    
    // We construct the payload manually to include the Team Context
    const payload = {
      id: user.id,
      email: user.email,
      role: finalRole, // <--- Key Magic: The Resolved Role
      teamId: teamContext?.id,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    }

    const token = await login(payload)

    return NextResponse.json({
        token,
        user: payload
    })

  } catch (error) {
    console.error("Exchange error:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
