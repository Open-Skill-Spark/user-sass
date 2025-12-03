import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { z } from "zod"
import { logActivity } from "@/lib/logger"

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member"]).default("member"),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession()
    const { slug } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, role } = inviteSchema.parse(body)

    // Get team
    const teams = await sql`
      SELECT * FROM teams WHERE slug = ${slug}
    `

    if (teams.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }
    const team = teams[0]

    // Check if current user is owner or admin
    const currentUserMembership = await sql`
      SELECT * FROM team_members 
      WHERE team_id = ${team.id} AND user_id = ${session.user.id}
    `

    if (
      currentUserMembership.length === 0 ||
      (currentUserMembership[0].role !== "owner" && currentUserMembership[0].role !== "admin")
    ) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Check if user to invite exists
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userToInvite = users[0]

    // Check if already a member
    const existingMembership = await sql`
      SELECT * FROM team_members 
      WHERE team_id = ${team.id} AND user_id = ${userToInvite.id}
    `

    if (existingMembership.length > 0) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 })
    }

    // Add member
    await sql`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (${team.id}, ${userToInvite.id}, ${role})
    `

    await logActivity(session.user.id, "invite_member", { 
      teamId: team.id, 
      invitedUserId: userToInvite.id, 
      role 
    })

    return NextResponse.json({ success: "Member added" })
  } catch (error) {
    console.error("Invite member error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
