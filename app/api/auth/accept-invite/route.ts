
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, login } from "@/lib/auth"
import { z } from "zod"

const acceptSchema = z.object({
  token: z.string(),
  password: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = acceptSchema.parse(body)

    // Find invitation
    const result = await sql`
      SELECT tm.*, u.id as user_id, u.email, u.password_hash
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.invitation_token = ${token}
      AND tm.status = 'invited'
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 400 })
    }

    const invitation = result[0]

    // Update user if needed
    if (invitation.password_hash === 'placeholder') {
      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 })
      }
      const hashedPassword = await hashPassword(password)
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, is_active = true 
        WHERE id = ${invitation.user_id}
      `
    }

    // Update membership
    await sql`
      UPDATE team_members 
      SET status = 'active', invitation_token = NULL 
      WHERE id = ${invitation.id}
    `

    // Log user in
    await login({
      id: invitation.user_id,
      email: invitation.email,
      role: 'user', // Global role
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Accept invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
