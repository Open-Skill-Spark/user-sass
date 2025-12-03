import { v4 as uuidv4 } from "uuid"
import { sql } from "@/lib/db"

export async function generateVerificationToken(email: string) {
  const token = uuidv4()
  const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

  const existingToken = await sql`
    SELECT * FROM verification_tokens WHERE identifier = ${email}
  `

  if (existingToken.length > 0) {
    await sql`
      DELETE FROM verification_tokens WHERE identifier = ${email}
    `
  }

  await sql`
    INSERT INTO verification_tokens (identifier, token, expires)
    VALUES (${email}, ${token}, ${expires})
  `

  return token
}

export async function generateTwoFactorToken(email: string) {
  const token = crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(0, 6)
  const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

  const existingToken = await sql`
    SELECT * FROM two_factor_tokens WHERE email = ${email}
  `

  if (existingToken.length > 0) {
    await sql`
      DELETE FROM two_factor_tokens WHERE email = ${email}
    `
  }

  await sql`
    INSERT INTO two_factor_tokens (email, token, expires)
    VALUES (${email}, ${token}, ${expires})
  `

  return token
}
