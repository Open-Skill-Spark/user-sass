import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const body = await request.json()
  const { name, slug: newSlug, domain, theme_color } = body

  // Validate input
  if (!name || !newSlug) {
    return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 })
  }

  const team = await sql`SELECT id FROM teams WHERE slug = ${slug}`
  if (team.length === 0) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  // Check permissions (Owner or Admin)
  const membership = await sql`
    SELECT role FROM team_members 
    WHERE team_id = ${team[0].id} AND user_id = ${session.user.id}
  `

  if (membership.length === 0 || (membership[0].role !== "owner" && membership[0].role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Check if new slug is taken (if changed)
  if (newSlug !== slug) {
    const existingSlug = await sql`SELECT id FROM teams WHERE slug = ${newSlug}`
    if (existingSlug.length > 0) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 })
    }
  }

  // Check if domain is taken (if provided and changed)
  if (domain) {
    const existingDomain = await sql`
      SELECT id FROM teams 
      WHERE domain = ${domain} AND id != ${team[0].id}
    `
    if (existingDomain.length > 0) {
      return NextResponse.json({ error: "Domain already taken" }, { status: 400 })
    }
  }

  try {
    const updatedTeam = await sql`
      UPDATE teams 
      SET 
        name = ${name}, 
        slug = ${newSlug}, 
        domain = ${domain || null}, 
        theme_color = ${theme_color || '#000000'},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${team[0].id}
      RETURNING *
    `

    return NextResponse.json({ team: updatedTeam[0] })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params

  const team = await sql`SELECT id FROM teams WHERE slug = ${slug}`
  if (team.length === 0) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  // Check permissions (Owner only)
  const membership = await sql`
    SELECT role FROM team_members 
    WHERE team_id = ${team[0].id} AND user_id = ${session.user.id}
  `

  if (membership.length === 0 || membership[0].role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await sql`DELETE FROM teams WHERE id = ${team[0].id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
