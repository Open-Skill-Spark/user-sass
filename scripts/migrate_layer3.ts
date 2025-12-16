import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" }); // Fallback

async function main() {
  const { sql } = await import("../lib/db");
  console.log("🔄 Starting Layer 3 (Advanced RBAC) Migration...");

  try {
    // 1. Create permissions table
    console.log("📦 Creating permissions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✅ permissions table created.");

    // 2. Create roles table
    console.log("📦 Creating roles table...");
    await sql`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✅ roles table created.");

    // 3. Create role_permissions table
    console.log("📦 Creating role_permissions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (role_id, permission_id)
      );
    `;
    console.log("✅ role_permissions table created.");

    // 4. Create user_permissions table
    console.log("📦 Creating user_permissions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        granted BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, permission_id)
      );
    `;
    console.log("✅ user_permissions table created.");

    // 5. Seed initial permissions
    console.log("📦 Seeding initial permissions...");
    const permissions = [
      // User Management
      { name: "users.view", description: "View user list", category: "users" },
      { name: "users.create", description: "Create new users", category: "users" },
      { name: "users.update", description: "Update user information", category: "users" },
      { name: "users.delete", description: "Delete users", category: "users" },
      { name: "users.suspend", description: "Suspend/activate users", category: "users" },
      
      // Team Management
      { name: "teams.view", description: "View teams", category: "teams" },
      { name: "teams.create", description: "Create teams", category: "teams" },
      { name: "teams.update", description: "Update team settings", category: "teams" },
      { name: "teams.delete", description: "Delete teams", category: "teams" },
      { name: "teams.manage_members", description: "Add/remove team members", category: "teams" },
      
      // Role Management
      { name: "roles.view", description: "View roles", category: "roles" },
      { name: "roles.create", description: "Create custom roles", category: "roles" },
      { name: "roles.update", description: "Update role permissions", category: "roles" },
      { name: "roles.delete", description: "Delete roles", category: "roles" },
      
      // Billing
      { name: "billing.view", description: "View billing information", category: "billing" },
      { name: "billing.manage", description: "Manage billing and subscriptions", category: "billing" },
      
      // System
      { name: "logs.view", description: "View activity logs", category: "system" },
      { name: "settings.manage", description: "Manage system settings", category: "system" },
    ];

    for (const perm of permissions) {
      await sql`
        INSERT INTO permissions (name, description, category)
        VALUES (${perm.name}, ${perm.description}, ${perm.category})
        ON CONFLICT (name) DO NOTHING;
      `;
    }
    console.log(`✅ Seeded ${permissions.length} permissions.`);

    // 6. Create system roles
    console.log("📦 Creating system roles...");
    const adminRole = await sql`
      INSERT INTO roles (name, description, is_system)
      VALUES ('admin', 'System administrator with full access', TRUE)
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id;
    `;

    const userRole = await sql`
      INSERT INTO roles (name, description, is_system)
      VALUES ('user', 'Standard user with basic access', TRUE)
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id;
    `;

    const moderatorRole = await sql`
      INSERT INTO roles (name, description, is_system)
      VALUES ('moderator', 'Moderator with elevated permissions', TRUE)
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id;
    `;
    console.log("✅ System roles created.");

    // 7. Assign permissions to admin role (all permissions)
    console.log("📦 Assigning permissions to admin role...");
    const allPermissions = await sql`SELECT id FROM permissions;`;
    for (const perm of allPermissions) {
      await sql`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (${adminRole[0].id}, ${perm.id})
        ON CONFLICT (role_id, permission_id) DO NOTHING;
      `;
    }
    console.log("✅ Admin role has all permissions.");

    // 8. Assign basic permissions to user role
    console.log("📦 Assigning permissions to user role...");
    const userPermissions = ["users.view", "teams.view"];
    for (const permName of userPermissions) {
      const perm = await sql`SELECT id FROM permissions WHERE name = ${permName};`;
      if (perm.length > 0) {
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${userRole[0].id}, ${perm[0].id})
          ON CONFLICT (role_id, permission_id) DO NOTHING;
        `;
      }
    }
    console.log("✅ User role permissions assigned.");

    // 9. Assign permissions to moderator role
    console.log("📦 Assigning permissions to moderator role...");
    const moderatorPermissions = [
      "users.view", "users.update", "users.suspend",
      "teams.view", "teams.update", "teams.manage_members",
      "logs.view"
    ];
    for (const permName of moderatorPermissions) {
      const perm = await sql`SELECT id FROM permissions WHERE name = ${permName};`;
      if (perm.length > 0) {
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${moderatorRole[0].id}, ${perm[0].id})
          ON CONFLICT (role_id, permission_id) DO NOTHING;
        `;
      }
    }
    console.log("✅ Moderator role permissions assigned.");

    // 10. Add role_id column to users table
    console.log("📦 Adding role_id column to users table...");
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='role_id';
    `;

    if (checkColumn.length === 0) {
      await sql`ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id);`;
      console.log("✅ role_id column added to users.");

      // 11. Migrate existing role data
      console.log("📦 Migrating existing user roles...");
      await sql`
        UPDATE users 
        SET role_id = (SELECT id FROM roles WHERE name = 'admin')
        WHERE role = 'admin';
      `;
      await sql`
        UPDATE users 
        SET role_id = (SELECT id FROM roles WHERE name = 'moderator')
        WHERE role = 'moderator';
      `;
      await sql`
        UPDATE users 
        SET role_id = (SELECT id FROM roles WHERE name = 'user')
        WHERE role = 'user' OR role_id IS NULL;
      `;
      console.log("✅ User roles migrated.");
    } else {
      console.log("ℹ️  role_id column already exists.");
    }

    console.log("🎉 Layer 3 Migration completed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("1. Update authentication logic to use role_id");
    console.log("2. Implement permission checking middleware");
    console.log("3. Create role management UI");
    console.log("4. After verification, drop the old 'role' column from users table");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
