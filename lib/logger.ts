import { sql } from "@/lib/db"
import { headers } from "next/headers"

export async function logActivity(
  userId: string | null,
  action: string,
  details: any = null
) {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    await sql`
      INSERT INTO activity_logs (user_id, action, details, ip_address)
      VALUES (${userId}, ${action}, ${details}, ${ip})
    `
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}
