import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
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

  const roles = await sql`
    SELECT * FROM team_roles 
    WHERE team_id = ${team[0].id} 
    ORDER BY created_at DESC
  `

  return NextResponse.json({ roles })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const { name } = await request.json()

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid role name" }, { status: 400 })
  }

  const team = await sql`SELECT id FROM teams WHERE slug = ${slug}`
  if (team.length === 0) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  // Check if user is owner
  const membership = await sql`
    SELECT role FROM team_members 
    WHERE team_id = ${team[0].id} AND user_id = ${session.user.id}
  `

  if (membership.length === 0 || membership[0].role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Check if role already exists
  const existingRole = await sql`
    SELECT id FROM team_roles 
    WHERE team_id = ${team[0].id} AND name = ${name}
  `

  if (existingRole.length > 0) {
    return NextResponse.json({ error: "Role already exists" }, { status: 400 })
  }

  try {
    const newRole = await sql`
      INSERT INTO team_roles (team_id, name)
      VALUES (${team[0].id}, ${name})
      RETURNING *
    `
    return NextResponse.json({ role: newRole[0] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
  }
}
