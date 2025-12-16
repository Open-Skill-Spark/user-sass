
import { sql } from "@/lib/db"

export interface SocialProfile {
  provider: string
  providerId: string
  email: string
  name?: string
  avatarUrl?: string
  data?: any
}

export async function linkOrRegisterSocialUser(profile: SocialProfile) {
  // 1. Check if identity exists
  const existingIdentities = await sql`
    SELECT user_id FROM identities 
    WHERE provider = ${profile.provider} AND provider_id = ${profile.providerId}
  `

  if (existingIdentities.length > 0) {
    const userId = existingIdentities[0].user_id
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (users.length > 0) {
        return users[0]
    }
    // If identity exists but user doesn't (shouldn't happen with CASCADE), we might need to cleanup or recreate. 
    // For now, let's proceed to try creating/finding user.
  }

  // 2. Check if user exists by email
  const existingUsers = await sql`
    SELECT * FROM users WHERE email = ${profile.email}
  `

  let user

  if (existingUsers.length > 0) {
    user = existingUsers[0]
  } else {
    // 3. Create new user
    const newUser = await sql`
      INSERT INTO users (email, name, password_hash, role, email_verified, user_metadata)
      VALUES (
        ${profile.email}, 
        ${profile.name || ''}, 
        '', -- No password for social users initially
        'user', 
        true, -- Trusted provider
        ${JSON.stringify({ avatar_url: profile.avatarUrl }) as any}
      )
      RETURNING *
    `
    user = newUser[0]
  }

  // 4. Link identity
  // We use ON CONFLICT DO NOTHING just in case, though we checked above.
  // Actually we verified it doesn't exist above, so we can just INSERT.
  // But strictly speaking, if we found the user via email, we still need to add the identity if it wasn't there.
  
  // Re-check identity for this specific user to be safe or just insert on conflict do nothing?
  // The unique constraint is on (provider, provider_id).
  
  try {
      await sql`
        INSERT INTO identities (user_id, provider, provider_id, profile_data)
        VALUES (
            ${user.id}, 
            ${profile.provider}, 
            ${profile.providerId}, 
            ${JSON.stringify(profile.data || {}) as any}
        )
        ON CONFLICT (provider, provider_id) DO NOTHING
      `
  } catch (e) {
      console.error("Failed to link identity", e)
  }

  return user
}
