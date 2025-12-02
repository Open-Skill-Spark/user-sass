import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, login } from "@/lib/auth"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, role)
      VALUES (${email}, ${hashedPassword}, 'user')
      RETURNING id, email, role
    `

    const user = result[0]

    // Send welcome email
    await sendEmail(email, "Welcome to SaaS App", emailTemplates.welcome(email.split("@")[0])).catch(console.error) // Don't block registration on email failure

    // Create session
    await login(user)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
