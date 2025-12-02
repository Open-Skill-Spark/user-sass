import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    const resets = await sql`
      SELECT * FROM password_resets 
      WHERE token = ${token} 
      AND expires_at > NOW()
    `

    if (resets.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const reset = resets[0]
    const hashedPassword = await hashPassword(password)

    // Update password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword} 
      WHERE id = ${reset.user_id}
    `

    // Delete used token
    await sql`
      DELETE FROM password_resets WHERE token = ${token}
    `

    const user = await sql`SELECT email FROM users WHERE id = ${reset.user_id}`
    if (user.length > 0) {
      await sendEmail(user[0].email, "Password Changed Successfully", emailTemplates.passwordChanged()).catch(
        console.error,
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
