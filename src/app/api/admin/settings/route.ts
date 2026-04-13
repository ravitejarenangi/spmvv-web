import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { updateSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("admin:settings");

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? "";

    const settings = await prisma.setting.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    const allowedDomains = await prisma.allowedDomain.findMany({
      orderBy: { domain: "asc" },
    });

    return NextResponse.json({ settings, allowedDomains });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission("admin:settings");

    const body = await req.json();
    const updates: { key: string; value: unknown }[] = body.updates ?? [];
    const domains: { add?: string[]; remove?: string[] } = body.domains ?? {};

    // Update settings
    if (updates.length > 0) {
      await updateSettings(updates);
    }

    // Manage allowed domains
    if (domains.add && domains.add.length > 0) {
      for (const domain of domains.add) {
        await prisma.allowedDomain.upsert({
          where: { domain },
          create: { domain, isActive: true },
          update: { isActive: true },
        });
      }
    }

    if (domains.remove && domains.remove.length > 0) {
      for (const domain of domains.remove) {
        await prisma.allowedDomain.update({
          where: { domain },
          data: { isActive: false },
        });
      }
    }

    return NextResponse.json({ message: "Settings updated" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
