import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { z } from "zod"
import { logActivity } from "@/lib/logger"

const settingsSchema = z.object({
  isTwoFactorEnabled: z.boolean().optional(),
  name: z.string().optional(),
  image: z.string().optional(),
})

export async function PATCH(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isTwoFactorEnabled, name, image } = settingsSchema.parse(body)

    const user = await sql`
      SELECT * FROM users WHERE id = ${session.user.id}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build dynamic update query
    const updates = []
    const values = []

    if (isTwoFactorEnabled !== undefined) {
      updates.push(`is_two_factor_enabled = ${isTwoFactorEnabled}`)
    }
    if (name !== undefined) {
      updates.push(`name = ${name}`)
    }
    if (image !== undefined) {
      updates.push(`image = ${image}`)
    }

    if (updates.length > 0) {
      await sql`
        UPDATE users
        SET is_two_factor_enabled = ${isTwoFactorEnabled !== undefined ? isTwoFactorEnabled : user[0].is_two_factor_enabled},
            name = ${name !== undefined ? name : user[0].name},
            image = ${image !== undefined ? image : user[0].image},
            updated_at = NOW()
        WHERE id = ${session.user.id}
      `
      await logActivity(session.user.id, "update_settings", { updates })
    }

    return NextResponse.json({ success: "Settings updated" })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
