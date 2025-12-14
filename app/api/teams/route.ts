import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { z } from "zod"
import { logActivity } from "@/lib/logger"

const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens"),
  parentTeamId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, parentTeamId } = createTeamSchema.parse(body)

    // Check if slug exists
    const existingTeam = await sql`
      SELECT * FROM teams WHERE slug = ${slug}
    `

    if (existingTeam.length > 0) {
      return NextResponse.json({ error: "Team with this slug already exists" }, { status: 400 })
    }

    // Create team
    const teamResult = await sql`
      INSERT INTO teams (name, slug, parent_team_id)
      VALUES (${name}, ${slug}, ${parentTeamId || null})
      RETURNING id, name, slug
    `
    const team = teamResult[0]

    // Add user as owner
    await sql`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (${team.id}, ${session.user.id}, 'owner')
    `

    await logActivity(session.user.id, "create_team", { teamId: team.id, name: team.name })

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Create team error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teams = await sql`
      SELECT t.*, tm.role
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ${session.user.id}
    `

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Get teams error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
