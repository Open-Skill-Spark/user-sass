import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      // Don't reveal if user exists
      return NextResponse.json({ success: true })
    }

    const user = users[0]
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await sql`
      INSERT INTO password_resets (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt})
    `

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await sendEmail(email, "Reset your password", emailTemplates.passwordReset(resetLink))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
