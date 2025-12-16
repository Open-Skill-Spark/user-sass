
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function generateAuthCode(userId: string): Promise<string> {
  const code = uuidv4()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await sql`
    INSERT INTO auth_codes (code, user_id, expires_at)
    VALUES (${code}, ${userId}, ${expiresAt})
  `

  return code
}

export async function validateAuthCode(code: string): Promise<string | null> {
  // Transaction: Select and Update in one go if possible, or just Select then Update.
  // We need to ensure it's not used twice.
  
  const result = await sql`
    SELECT user_id, expires_at, used
    FROM auth_codes
    WHERE code = ${code}
  `

  if (result.length === 0) {
    return null
  }

  const { user_id, expires_at, used } = result[0]

  if (used) {
    return null
  }

  if (new Date() > new Date(expires_at)) {
    return null
  }

  // Mark as used
  await sql`
    UPDATE auth_codes
    SET used = TRUE
    WHERE code = ${code}
  `

  return user_id
}
