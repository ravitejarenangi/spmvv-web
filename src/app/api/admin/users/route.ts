import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("admin:users:read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role") ?? "";
    const status = searchParams.get("status") ?? "";

    const users = await prisma.user.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(role ? { role: { name: role } } : {}),
        ...(status === "active"
          ? { isActive: true }
          : status === "inactive"
          ? { isActive: false }
          : {}),
      },
      include: {
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("admin:users:write");

    const { id, roleId, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "User id is required" }, { status: 400 });
    }

    // Protect last superadmin from demotion or deactivation
    const superadminRole = await prisma.role.findFirst({ where: { name: "superadmin" } });
    if (superadminRole) {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (targetUser?.roleId === superadminRole.id) {
        const superadminCount = await prisma.user.count({
          where: { roleId: superadminRole.id, isActive: true },
        });
        const isDemoting = roleId && roleId !== superadminRole.id;
        const isDeactivating = isActive === false;
        if ((isDemoting || isDeactivating) && superadminCount <= 1) {
          return NextResponse.json(
            { message: "Cannot demote or deactivate the last superadmin" },
            { status: 400 }
          );
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(roleId !== undefined ? { roleId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: { role: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("PUT /api/admin/users error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("admin:users:delete");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "User id is required" }, { status: 400 });
    }

    // Protect last superadmin from deletion
    const superadminRole = await prisma.role.findFirst({ where: { name: "superadmin" } });
    if (superadminRole) {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (targetUser?.roleId === superadminRole.id) {
        const superadminCount = await prisma.user.count({
          where: { roleId: superadminRole.id },
        });
        if (superadminCount <= 1) {
          return NextResponse.json(
            { message: "Cannot delete the last superadmin" },
            { status: 400 }
          );
        }
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
