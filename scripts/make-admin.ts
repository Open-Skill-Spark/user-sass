import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const { sql } = await import("../lib/db");
  
  // Get email from command line argument
  const email = process.argv[2];
  
  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: npx tsx scripts/make-admin.ts user@example.com");
    process.exit(1);
  }

  console.log(`🔄 Making ${email} an admin...`);

  try {
    // Check if user exists
    const user = await sql`
      SELECT id, email, role FROM users WHERE email = ${email} LIMIT 1
    `;

    if (user.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user[0].email} (current role: ${user[0].role})`);

    // Update user role to admin
    await sql`
      UPDATE users SET role = 'admin' WHERE email = ${email}
    `;

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log("\n📝 Next steps:");
    console.log("1. Log out from your application");
    console.log("2. Log back in");
    console.log("3. You should now see all admin menu items");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
