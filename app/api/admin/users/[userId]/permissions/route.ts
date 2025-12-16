import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getUserPermissions,
  grantPermissionToUser,
  revokePermissionFromUser,
  removePermissionOverride,
} from "@/lib/permissions";
import { sql } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // TODO: Check if user has 'users.view' permission
    // For now, only allow admins or the user themselves
    if (user.role !== "admin" && user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }



    // Get user's role
    const userData = await sql`
      SELECT u.id, u.name, u.email, r.id as role_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get effective permissions
    const permissions = await getUserPermissions(userId);

    // Get permission overrides
    const overrides = await sql`
      SELECT p.name, up.granted
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ${userId}
    `;

    return NextResponse.json({
      user: userData[0],
      permissions,
      overrides: overrides.map((o) => ({
        permission: o.name,
        granted: o.granted,
      })),
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // TODO: Check if user has 'users.update' permission
    // For now, only allow admins
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    const body = await req.json();
    const { permission, granted } = body;

    if (!permission || typeof granted !== "boolean") {
      return NextResponse.json(
        { error: "Permission name and granted status are required" },
        { status: 400 }
      );
    }

    // Grant or revoke the permission
    if (granted) {
      await grantPermissionToUser(userId, permission);
    } else {
      await revokePermissionFromUser(userId, permission);
    }

    return NextResponse.json({
      message: `Permission ${granted ? "granted" : "revoked"} successfully`,
    });
  } catch (error: any) {
    console.error("Error updating user permission:", error);

    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // TODO: Check if user has 'users.update' permission
    // For now, only allow admins
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    const { searchParams } = new URL(req.url);
    const permission = searchParams.get("permission");

    if (!permission) {
      return NextResponse.json(
        { error: "Permission name is required" },
        { status: 400 }
      );
    }

    // Remove the override
    await removePermissionOverride(userId, permission);

    return NextResponse.json({
      message: "Permission override removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing permission override:", error);

    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
