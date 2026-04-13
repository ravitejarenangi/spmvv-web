import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("admin:roles");

    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/roles error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("admin:roles");

    const { name, description, permissions } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Role name is required" }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description: description ?? null,
        permissions: {
          create: (permissions ?? []).map((permission: string) => ({ permission })),
        },
      },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("POST /api/admin/roles error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("admin:roles");

    const { id, permissions } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Role id is required" }, { status: 400 });
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ message: "permissions must be an array" }, { status: 400 });
    }

    // Delete all existing permissions then recreate from array
    await prisma.rolePermission.deleteMany({ where: { roleId: id } });

    const role = await prisma.role.update({
      where: { id },
      data: {
        permissions: {
          create: permissions.map((permission: string) => ({ permission })),
        },
      },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json({ role });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("PUT /api/admin/roles error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
