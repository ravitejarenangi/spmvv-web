import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.permissions.includes("pdf:download")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    if (document.isRestricted && !session.user.permissions.includes("pdf:restricted")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), "uploads", document.filepath);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json({ message: "File not found on disk" }, { status: 404 });
    }

    const filename = path.basename(document.filepath);

    return new Response(fileBuffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Document download error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
