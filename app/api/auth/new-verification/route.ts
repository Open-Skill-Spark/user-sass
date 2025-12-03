import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    const existingToken = await sql`
      SELECT * FROM verification_tokens WHERE token = ${token}
    `

    if (existingToken.length === 0) {
      return NextResponse.json({ error: "Token does not exist!" }, { status: 400 })
    }

    const hasExpired = new Date(existingToken[0].expires) < new Date()

    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired!" }, { status: 400 })
    }

    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${existingToken[0].identifier}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "Email does not exist!" }, { status: 400 })
    }

    await sql`
      UPDATE users 
      SET email_verified = ${new Date()}, 
          email = ${existingToken[0].identifier}
      WHERE id = ${existingUser[0].id}
    `

    await sql`
      DELETE FROM verification_tokens WHERE identifier = ${existingToken[0].identifier}
    `

    return NextResponse.json({ success: "Email verified!" })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 })
  }
}
