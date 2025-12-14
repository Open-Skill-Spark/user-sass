import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  console.log("Adding team_roles table...")

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS team_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (team_id, name)
      );
    `
    console.log("Created team_roles table")
  } catch (error) {
    console.error("Error creating team_roles table:", error)
    process.exit(1)
  }
}

main()
