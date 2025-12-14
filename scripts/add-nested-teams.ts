
import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  console.log("Adding parent_team_id to teams table...")

  try {
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'parent_team_id') THEN
          ALTER TABLE teams ADD COLUMN parent_team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `
    console.log("Added parent_team_id to teams table")
  } catch (error) {
    console.error("Error updating teams table:", error)
    process.exit(1)
  }
}

main()
