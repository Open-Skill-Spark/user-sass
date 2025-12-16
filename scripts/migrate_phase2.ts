
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" }); // Fallback

async function main() {
  const { sql } = await import("../lib/db");
  console.log("🔄 Starting Phase 2 Migration...");

  try {
    // 1. Add metadata columns to users table
    console.log("📦 Adding metadata columns to users...");
    
    // Check for user_metadata
    const checkUserMeta = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='user_metadata';
    `;
    if (checkUserMeta.length === 0) {
        await sql`ALTER TABLE users ADD COLUMN user_metadata JSONB DEFAULT '{}'::jsonb;`;
        console.log("✅ user_metadata added.");
    } else {
        console.log("ℹ️ user_metadata already exists.");
    }

    // Check for app_metadata
    const checkAppMeta = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='app_metadata';
    `;
    if (checkAppMeta.length === 0) {
        await sql`ALTER TABLE users ADD COLUMN app_metadata JSONB DEFAULT '{}'::jsonb;`;
        console.log("✅ app_metadata added.");
    } else {
        console.log("ℹ️ app_metadata already exists.");
    }

    // 2. Create identities table
    console.log("📦 Creating identities table...");
    await sql`
      CREATE TABLE IF NOT EXISTS identities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL, -- 'google', 'github', 'email'
        provider_id VARCHAR(255) NOT NULL, -- The unique ID from the provider
        profile_data JSONB DEFAULT '{}'::jsonb, -- Store avatar, link, etc.
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_id) -- Prevent duplicate linking
      );
    `;
    console.log("✅ identities table created.");

    console.log("🎉 Phase 2 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
