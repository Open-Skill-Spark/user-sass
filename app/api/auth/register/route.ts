import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"
import { generateVerificationToken } from "@/lib/tokens"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  privacy: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
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
    const now = new Date()

    // Create user
    await sql`
      INSERT INTO users (email, password_hash, role, terms_accepted_at, privacy_accepted_at)
      VALUES (${email}, ${hashedPassword}, 'user', ${now}, ${now})
    `

    // Generate verification token
    const verificationToken = await generateVerificationToken(email)

    // Send verification email
    await sendEmail(
      email,
      "Verify your email",
      emailTemplates.emailVerification(verificationToken)
    )

    return NextResponse.json({ success: "Confirmation email sent!" })
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
