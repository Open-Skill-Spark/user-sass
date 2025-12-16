import { sql } from './db';

/**
 * Check if a user has a specific permission
 * @param userId - The user's UUID
 * @param permissionName - The permission name (e.g., 'users.view')
 * @returns Promise<boolean> - True if user has the permission
 */
export async function hasPermission(
  userId: string,
  permissionName: string
): Promise<boolean> {
  try {
    // 1. Check user-specific permission overrides first
    const userOverride = await sql`
      SELECT up.granted
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ${userId} AND p.name = ${permissionName}
    `;
    
    // If there's an override, use it (true = granted, false = revoked)
    if (userOverride.length > 0) {
      return userOverride[0].granted;
    }
    
    // 2. Check role permissions
    const rolePermission = await sql`
      SELECT 1
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ${userId} AND p.name = ${permissionName}
      LIMIT 1
    `;
    
    return rolePermission.length > 0;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a user has ANY of the specified permissions
 * @param userId - The user's UUID
 * @param permissionNames - Array of permission names
 * @returns Promise<boolean> - True if user has at least one permission
 */
export async function hasAnyPermission(
  userId: string,
  permissionNames: string[]
): Promise<boolean> {
  for (const permission of permissionNames) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has ALL of the specified permissions
 * @param userId - The user's UUID
 * @param permissionNames - Array of permission names
 * @returns Promise<boolean> - True if user has all permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissionNames: string[]
): Promise<boolean> {
  for (const permission of permissionNames) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all effective permissions for a user (role permissions + overrides)
 * @param userId - The user's UUID
 * @returns Promise<string[]> - Array of permission names
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // Get role permissions
    const rolePermissions = await sql`
      SELECT DISTINCT p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ${userId}
    `;
    
    // Get user permission overrides
    const userOverrides = await sql`
      SELECT p.name, up.granted
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ${userId}
    `;
    
    // Build the final permission set
    const permissionSet = new Set<string>();
    
    // Add role permissions
    rolePermissions.forEach(p => permissionSet.add(p.name));
    
    // Apply overrides
    userOverrides.forEach(override => {
      if (override.granted) {
        permissionSet.add(override.name);
      } else {
        permissionSet.delete(override.name);
      }
    });
    
    return Array.from(permissionSet);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Get user's role information
 * @param userId - The user's UUID
 * @returns Promise<Role | null> - Role object or null
 */
export async function getUserRole(userId: string) {
  try {
    const result = await sql`
      SELECT r.id, r.name, r.description, r.is_system
      FROM roles r
      JOIN users u ON u.role_id = r.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Grant a permission to a user (override)
 * @param userId - The user's UUID
 * @param permissionName - The permission name
 */
export async function grantPermissionToUser(
  userId: string,
  permissionName: string
): Promise<void> {
  try {
    const permission = await sql`
      SELECT id FROM permissions WHERE name = ${permissionName} LIMIT 1
    `;
    
    if (permission.length === 0) {
      throw new Error(`Permission '${permissionName}' not found`);
    }
    
    await sql`
      INSERT INTO user_permissions (user_id, permission_id, granted)
      VALUES (${userId}, ${permission[0].id}, TRUE)
      ON CONFLICT (user_id, permission_id) 
      DO UPDATE SET granted = TRUE
    `;
  } catch (error) {
    console.error('Error granting permission:', error);
    throw error;
  }
}

/**
 * Revoke a permission from a user (override)
 * @param userId - The user's UUID
 * @param permissionName - The permission name
 */
export async function revokePermissionFromUser(
  userId: string,
  permissionName: string
): Promise<void> {
  try {
    const permission = await sql`
      SELECT id FROM permissions WHERE name = ${permissionName} LIMIT 1
    `;
    
    if (permission.length === 0) {
      throw new Error(`Permission '${permissionName}' not found`);
    }
    
    await sql`
      INSERT INTO user_permissions (user_id, permission_id, granted)
      VALUES (${userId}, ${permission[0].id}, FALSE)
      ON CONFLICT (user_id, permission_id) 
      DO UPDATE SET granted = FALSE
    `;
  } catch (error) {
    console.error('Error revoking permission:', error);
    throw error;
  }
}

/**
 * Remove a permission override (revert to role default)
 * @param userId - The user's UUID
 * @param permissionName - The permission name
 */
export async function removePermissionOverride(
  userId: string,
  permissionName: string
): Promise<void> {
  try {
    const permission = await sql`
      SELECT id FROM permissions WHERE name = ${permissionName} LIMIT 1
    `;
    
    if (permission.length === 0) {
      throw new Error(`Permission '${permissionName}' not found`);
    }
    
    await sql`
      DELETE FROM user_permissions
      WHERE user_id = ${userId} AND permission_id = ${permission[0].id}
    `;
  } catch (error) {
    console.error('Error removing permission override:', error);
    throw error;
  }
}

/**
 * Get all permissions with their categories
 */
export async function getAllPermissions() {
  try {
    return await sql`
      SELECT id, name, description, category
      FROM permissions
      ORDER BY category, name
    `;
  } catch (error) {
    console.error('Error getting all permissions:', error);
    return [];
  }
}

/**
 * Get all roles with their permissions
 */
export async function getAllRoles() {
  try {
    const roles = await sql`
      SELECT id, name, description, is_system
      FROM roles
      ORDER BY is_system DESC, name
    `;
    
    // Get permissions for each role
    for (const role of roles) {
      const permissions = await sql`
        SELECT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ${role.id}
      `;
      role.permissions = permissions.map(p => p.name);
    }
    
    return roles;
  } catch (error) {
    console.error('Error getting all roles:', error);
    return [];
  }
}

/**
 * Create a new role with permissions
 */
export async function createRole(
  name: string,
  description: string,
  permissionNames: string[]
) {
  try {
    // Create the role
    const role = await sql`
      INSERT INTO roles (name, description, is_system)
      VALUES (${name}, ${description}, FALSE)
      RETURNING id
    `;
    
    const roleId = role[0].id;
    
    // Assign permissions
    for (const permName of permissionNames) {
      const permission = await sql`
        SELECT id FROM permissions WHERE name = ${permName} LIMIT 1
      `;
      
      if (permission.length > 0) {
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${roleId}, ${permission[0].id})
        `;
      }
    }
    
    return roleId;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
}

/**
 * Update role permissions
 */
export async function updateRolePermissions(
  roleId: string,
  permissionNames: string[]
) {
  try {
    // Remove all existing permissions
    await sql`DELETE FROM role_permissions WHERE role_id = ${roleId}`;
    
    // Add new permissions
    for (const permName of permissionNames) {
      const permission = await sql`
        SELECT id FROM permissions WHERE name = ${permName} LIMIT 1
      `;
      
      if (permission.length > 0) {
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${roleId}, ${permission[0].id})
        `;
      }
    }
  } catch (error) {
    console.error('Error updating role permissions:', error);
    throw error;
  }
}

/**
 * Delete a role (only non-system roles)
 */
export async function deleteRole(roleId: string) {
  try {
    const role = await sql`
      SELECT is_system FROM roles WHERE id = ${roleId} LIMIT 1
    `;
    
    if (role.length === 0) {
      throw new Error('Role not found');
    }
    
    if (role[0].is_system) {
      throw new Error('Cannot delete system role');
    }
    
    await sql`DELETE FROM roles WHERE id = ${roleId}`;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
}
