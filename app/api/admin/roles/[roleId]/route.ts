import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateRolePermissions } from "@/lib/permissions";
import { sql } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // TODO: Check if user has 'roles.update' permission
    // For now, only allow admins
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, permissions } = body;

    // Check if role exists and is not a system role
    const role = await sql`
      SELECT is_system FROM roles WHERE id = ${roleId} LIMIT 1
    `;

    if (role.length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Update role metadata if provided
    if (name || description) {
      await sql`
        UPDATE roles
        SET 
          name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${roleId}
      `;
    }

    // Update permissions if provided
    if (Array.isArray(permissions)) {
      await updateRolePermissions(roleId, permissions);
    }

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error: any) {
    console.error("Error updating role:", error);

    if (error.message?.includes("duplicate") || error.code === "23505") {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // TODO: Check if user has 'roles.view' permission
    // For now, only allow admins
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { roleId } = params;

    // Get role details
    const roleData = await sql`
      SELECT id, name, description, is_system, created_at, updated_at
      FROM roles
      WHERE id = ${roleId}
      LIMIT 1
    `;

    if (roleData.length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const role = roleData[0];

    // Get role permissions
    const permissions = await sql`
      SELECT p.id, p.name, p.description, p.category
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${roleId}
      ORDER BY p.category, p.name
    `;

    return NextResponse.json({
      role: {
        ...role,
        permissions: permissions.map((p) => p.name),
        permissionDetails: permissions,
      },
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
