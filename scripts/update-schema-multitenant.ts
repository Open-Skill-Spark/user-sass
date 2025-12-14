
import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  console.log("Updating database schema for multi-tenancy...")

  try {
    // Add status to team_members if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'status') THEN
          ALTER TABLE team_members ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
        END IF;
      END $$;
    `
    console.log("Added status to team_members")

    // Add invitation_token to team_members if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'invitation_token') THEN
          ALTER TABLE team_members ADD COLUMN invitation_token TEXT;
        END IF;
      END $$;
    `
    console.log("Added invitation_token to team_members")

    // Add tenant_id to activity_logs if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'tenant_id') THEN
          ALTER TABLE activity_logs ADD COLUMN tenant_id UUID REFERENCES teams(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `
    console.log("Added tenant_id to activity_logs")

    console.log("Database schema update complete!")
  } catch (error) {
    console.error("Error updating database:", error)
    process.exit(1)
  }
}

main()
