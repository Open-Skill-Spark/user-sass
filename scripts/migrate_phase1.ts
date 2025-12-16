import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" }); // Fallback

async function main() {
  const { sql } = await import("../lib/db");
  console.log("🔄 Starting Phase 1 Migration...");

  try {
    // 1. Create auth_codes table
    console.log("📦 Creating auth_codes table...");
    await sql`
      CREATE TABLE IF NOT EXISTS auth_codes (
        code VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE
      );
    `;
    console.log("✅ auth_codes table created.");

    // 2. Add domain column to teams table
    console.log("📦 Adding domain column to teams...");
    // Check if column exists first to avoid error
    const checkColumn = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='teams' AND column_name='domain';
    `;

    if (checkColumn.length === 0) {
        await sql`ALTER TABLE teams ADD COLUMN domain VARCHAR(255) UNIQUE;`;
        console.log("✅ domain column added to teams.");
    } else {
        console.log("ℹ️ domain column already exists.");
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
