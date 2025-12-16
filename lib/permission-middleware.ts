import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./auth";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "./permissions";

/**
 * Middleware to check if user has a specific permission
 */
export async function requirePermission(
  req: NextRequest,
  permissionName: string
): Promise<{ user: any; error?: NextResponse }> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const allowed = await hasPermission(user.id, permissionName);

  if (!allowed) {
    return {
      user,
      error: NextResponse.json(
        { error: `Missing required permission: ${permissionName}` },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Middleware to check if user has ANY of the specified permissions
 */
export async function requireAnyPermission(
  req: NextRequest,
  permissionNames: string[]
): Promise<{ user: any; error?: NextResponse }> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const allowed = await hasAnyPermission(user.id, permissionNames);

  if (!allowed) {
    return {
      user,
      error: NextResponse.json(
        {
          error: `Missing required permissions. Need one of: ${permissionNames.join(", ")}`,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Middleware to check if user has ALL of the specified permissions
 */
export async function requireAllPermissions(
  req: NextRequest,
  permissionNames: string[]
): Promise<{ user: any; error?: NextResponse }> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const allowed = await hasAllPermissions(user.id, permissionNames);

  if (!allowed) {
    return {
      user,
      error: NextResponse.json(
        {
          error: `Missing required permissions: ${permissionNames.join(", ")}`,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Check if user is admin (legacy support during migration)
 */
export async function requireAdmin(
  req: NextRequest
): Promise<{ user: any; error?: NextResponse }> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // During migration, check both old role field and new permission system
  const isAdmin = user.role === "admin" || (await hasPermission(user.id, "users.delete"));

  if (!isAdmin) {
    return {
      user,
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { user };
}
