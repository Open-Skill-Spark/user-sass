import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  console.log("Adding branding columns to teams table...")

  try {
    await sql`
      ALTER TABLE teams 
      ADD COLUMN IF NOT EXISTS domain TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#000000',
      ADD COLUMN IF NOT EXISTS logo_url TEXT;
    `
    console.log("Added branding columns to teams table")
  } catch (error) {
    console.error("Error updating teams table:", error)
    process.exit(1)
  }
}

main()
