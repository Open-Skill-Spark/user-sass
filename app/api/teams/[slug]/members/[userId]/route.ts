import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/logger"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await getSession()
    const { slug, userId } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Cannot remove self (leave team logic is separate usually, but for simplicity allow if not owner or if multiple owners)
    // For now, prevent removing self if owner to avoid orphaned teams
    if (userId === session.user.id && currentUserMembership[0].role === "owner") {
       return NextResponse.json({ error: "Owners cannot remove themselves" }, { status: 400 })
    }

    // Remove member
    await sql`
      DELETE FROM team_members 
      WHERE team_id = ${team.id} AND user_id = ${userId}
    `

    await logActivity(session.user.id, "remove_member", { 
      teamId: team.id, 
      removedUserId: userId 
    })

    return NextResponse.json({ success: "Member removed" })
  } catch (error) {
    console.error("Remove member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
