
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { z } from "zod"

// GET /api/user - Get own profile
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await sql`
    SELECT id, email, role, user_metadata, app_metadata, created_at 
    FROM users 
    WHERE id = ${session.user.id}
  `

  if (result.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(result[0])
}

const updateSchema = z.object({
  user_metadata: z.record(z.any()), // Allow any JSON object
})

// PATCH /api/user - Update own user_metadata
export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { user_metadata } = updateSchema.parse(body)

    // Merge existing metadata with new metadata (shallow merge? or deep?)
    // Postgres || operator concatenates jsonb.
    // user_metadata || ${user_metadata} will merge keys.

    const result = await sql`
      UPDATE users 
      SET user_metadata = user_metadata || ${JSON.stringify(user_metadata)}::jsonb
      WHERE id = ${session.user.id}
      RETURNING id, email, role, user_metadata, app_metadata
    `

    return NextResponse.json(result[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Update User Error:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
