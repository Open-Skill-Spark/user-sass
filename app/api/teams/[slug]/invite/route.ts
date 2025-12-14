
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireTenantPermission } from "@/lib/tenant"
import { z } from "zod"
import { randomBytes } from "crypto"

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    // Ensure requester is at least an admin
    const context = await requireTenantPermission(slug, "admin")
    
    const body = await request.json()
    const { email, role } = inviteSchema.parse(body)

    // Check if user exists
    const existingUsers = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `

    let userId: string

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id
      
      // Check if already a member
      const existingMember = await sql`
        SELECT id FROM team_members 
        WHERE team_id = ${context.tenant.id} AND user_id = ${userId}
      `

      if (existingMember.length > 0) {
        return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 })
      }
    } else {
      // Create placeholder user
      const newUser = await sql`
        INSERT INTO users (email, password_hash, role, is_active)
        VALUES (${email}, 'placeholder', 'user', true)
        RETURNING id
      `
      userId = newUser[0].id
    }

    // Generate invitation token
    const token = randomBytes(32).toString("hex")

    // Create membership
    await sql`
      INSERT INTO team_members (team_id, user_id, role, status, invitation_token)
      VALUES (${context.tenant.id}, ${userId}, ${role}, 'invited', ${token})
    `

    // TODO: Send invitation email with link: /accept-invite?token=${token}
    console.log(`Invitation link: http://localhost:3000/accept-invite?token=${token}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Invite error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
