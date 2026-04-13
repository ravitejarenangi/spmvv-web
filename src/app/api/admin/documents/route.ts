import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import * as fs from "fs";
import * as path from "path";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("admin:documents");

    const documents = await prisma.document.findMany({
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        _count: { select: { chunks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/documents error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission("admin:documents");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string;
    const subject = formData.get("subject") as string | null;
    const code = formData.get("code") as string | null;
    const description = formData.get("description") as string | null;
    const isRestricted = formData.get("isRestricted") === "true";

    if (!file || !category) {
      return NextResponse.json(
        { message: "file and category are required" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ message: "Only PDF files are supported" }, { status: 400 });
    }

    // Determine subfolder based on category
    const subfolder = category.toLowerCase().replace(/\s+/g, "_");
    const uploadsDir = path.join(process.cwd(), "uploads", subfolder);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${safeFilename}`;
    const fullPath = path.join(uploadsDir, filename);
    const relativePath = path.join("uploads", subfolder, filename);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(fullPath, Buffer.from(arrayBuffer));

    const document = await prisma.document.create({
      data: {
        filename: file.name,
        filepath: relativePath,
        category,
        subject: subject ?? null,
        code: code ?? null,
        description: description ?? null,
        uploadedBy: session.user.id ?? null,
        isRestricted,
      },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        _count: { select: { chunks: true } },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("POST /api/admin/documents error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission("admin:documents");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Document id is required" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // Remove file from disk
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    // Delete record (cascades to chunks)
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ message: "Document deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("DELETE /api/admin/documents error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
