import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPermissions } from "@/lib/permissions";

export async function GET(req: NextRequest) {
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

    // Get all permissions
    const permissions = await getAllPermissions();

    // Group by category
    const grouped = permissions.reduce((acc: any, perm: any) => {
      const category = perm.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: perm.id,
        name: perm.name,
        description: perm.description,
      });
      return acc;
    }, {});

    return NextResponse.json({
      permissions,
      grouped,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
