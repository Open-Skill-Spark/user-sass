import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllRoles, createRole, deleteRole } from "@/lib/permissions";

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

    // Get all roles with their permissions
    const roles = await getAllRoles();

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // TODO: Check if user has 'roles.create' permission
    // For now, only allow admins
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, permissions } = body;

    // Validate input
    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Permissions must be an array" },
        { status: 400 }
      );
    }

    // Create the role
    const roleId = await createRole(name, description, permissions);

    return NextResponse.json(
      { 
        message: "Role created successfully",
        roleId 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating role:", error);
    
    // Handle duplicate role name
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

export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    // TODO: Check if user has 'roles.delete' permission
    // For now, only allow admins
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    // Delete the role
    await deleteRole(roleId);

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting role:", error);
    
    if (error.message?.includes("system role")) {
      return NextResponse.json(
        { error: "Cannot delete system role" },
        { status: 403 }
      );
    }
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
