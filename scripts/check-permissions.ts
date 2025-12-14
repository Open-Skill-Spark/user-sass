import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  const slug = 'test-team'

  console.log(`Checking team: ${slug}`)

  const teams = await sql`SELECT * FROM teams WHERE slug = ${slug}`
  if (teams.length === 0) {
    console.log("Team not found")
    return
  }
  console.log("Team found:", teams[0].name)

  const members = await sql`
    SELECT u.email, tm.role 
    FROM team_members tm 
    JOIN users u ON tm.user_id = u.id 
    WHERE tm.team_id = ${teams[0].id}
  `
  console.log("Members:", members)

  // Check if team_roles table exists
  try {
    const roles = await sql`SELECT * FROM team_roles WHERE team_id = ${teams[0].id}`
    console.log("Existing custom roles:", roles)
  } catch (e) {
    console.log("Error querying team_roles (table might not exist):", e)
  }
}

main()
