import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { comparePassword, login } from "@/lib/auth"
import { z } from "zod"
import { generateTwoFactorToken } from "@/lib/tokens"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"
import { logActivity } from "@/lib/logger"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  code: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, code } = loginSchema.parse(body)

    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    const user = users[0]

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (user.is_two_factor_enabled && user.email_verified) {
      if (code) {
        const twoFactorToken = await sql`
          SELECT * FROM two_factor_tokens WHERE email = ${user.email}
        `

        if (twoFactorToken.length === 0) {
          return NextResponse.json({ error: "Invalid code" }, { status: 400 })
        }

        if (twoFactorToken[0].token !== code) {
          return NextResponse.json({ error: "Invalid code" }, { status: 400 })
        }

        const hasExpired = new Date(twoFactorToken[0].expires) < new Date()

        if (hasExpired) {
          return NextResponse.json({ error: "Code expired" }, { status: 400 })
        }

        await sql`
          DELETE FROM two_factor_tokens WHERE id = ${twoFactorToken[0].id}
        `

        const existingConfirmation = await sql`
          SELECT * FROM two_factor_confirmations WHERE user_id = ${user.id}
        `

        if (existingConfirmation.length > 0) {
          await sql`
            DELETE FROM two_factor_confirmations WHERE id = ${existingConfirmation[0].id}
          `
        }

        await sql`
          INSERT INTO two_factor_confirmations (user_id) VALUES (${user.id})
        `
      } else {
        const twoFactorToken = await generateTwoFactorToken(user.email)
        await sendEmail(
          user.email,
          "2FA Code",
          emailTemplates.twoFactorToken(twoFactorToken)
        )

        return NextResponse.json({ twoFactor: true })
      }
    }

    // Create session
    const token = await login({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    await logActivity(user.id, "login", { method: "email" })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
