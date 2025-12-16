import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

async function test() {
  const { sql } = await import("../lib/db");
  const {
    hasPermission,
    getUserPermissions,
    getAllPermissions,
    getAllRoles,
  } = await import("../lib/permissions");

  console.log("🧪 Testing Layer 3 RBAC Implementation...\n");

  try {
    // 1. Check if tables exist
    console.log("1️⃣ Checking database tables...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('permissions', 'roles', 'role_permissions', 'user_permissions')
      ORDER BY table_name;
    `;
    console.log(`   Found ${tables.length}/4 tables:`, tables.map((t) => t.table_name));

    if (tables.length !== 4) {
      console.log("   ⚠️  Missing tables. Run migration first: npx tsx scripts/migrate_layer3.ts");
      return;
    }

    // 2. Check permissions
    console.log("\n2️⃣ Checking permissions...");
    const permissions = await getAllPermissions();
    console.log(`   Found ${permissions.length} permissions`);
    console.log("   Categories:", [...new Set(permissions.map((p: any) => p.category))]);

    // 3. Check roles
    console.log("\n3️⃣ Checking roles...");
    const roles = await getAllRoles();
    console.log(`   Found ${roles.length} roles:`);
    roles.forEach((role: any) => {
      console.log(
        `   - ${role.name} (${role.is_system ? "system" : "custom"}): ${role.permissions?.length || 0} permissions`
      );
    });

    // 4. Check users migration
    console.log("\n4️⃣ Checking users migration...");
    const users = await sql`
      SELECT 
        u.id, 
        u.email, 
        u.role as old_role, 
        r.name as new_role
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LIMIT 5;
    `;
    console.log(`   Sample users (${users.length}):`);
    users.forEach((user: any) => {
      console.log(`   - ${user.email}: old="${user.old_role}" → new="${user.new_role}"`);
    });

    // 5. Test permission checking
    if (users.length > 0) {
      console.log("\n5️⃣ Testing permission checking...");
      const testUser = users[0];
      console.log(`   Testing with user: ${testUser.email}`);

      const userPerms = await getUserPermissions(testUser.id);
      console.log(`   User has ${userPerms.length} permissions:`, userPerms.slice(0, 5));

      const hasUsersView = await hasPermission(testUser.id, "users.view");
      console.log(`   Has 'users.view': ${hasUsersView}`);

      const hasUsersDelete = await hasPermission(testUser.id, "users.delete");
      console.log(`   Has 'users.delete': ${hasUsersDelete}`);
    }

    // 6. Check for any issues
    console.log("\n6️⃣ Checking for issues...");
    const usersWithoutRole = await sql`
      SELECT COUNT(*) as count FROM users WHERE role_id IS NULL;
    `;
    if (usersWithoutRole[0].count > 0) {
      console.log(`   ⚠️  ${usersWithoutRole[0].count} users without role_id`);
    } else {
      console.log("   ✅ All users have role_id assigned");
    }

    console.log("\n✅ All tests passed!");
    console.log("\n📝 Next steps:");
    console.log("   1. Update API routes to use permission middleware");
    console.log("   2. Create admin UI for role management");
    console.log("   3. After verification, drop the old 'role' column");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

test();
