import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  console.log("Adding is_suspended column to teams table...")

  try {
    await sql`
      ALTER TABLE teams 
      ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
    `
    console.log("Added is_suspended column to teams table")
  } catch (error) {
    console.error("Error updating teams table:", error)
    process.exit(1)
  }
}

main()
