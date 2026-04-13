import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { ingestDocument, ingestAllDocuments } from "@/lib/ingest";

export async function POST(req: NextRequest) {
  try {
    await requirePermission("admin:documents:write");

    const body = await req.json().catch(() => ({}));
    const { documentId } = body;

    if (documentId) {
      const chunks = await ingestDocument(documentId);
      return NextResponse.json({ ingested: 1, chunks });
    }

    const result = await ingestAllDocuments();
    return NextResponse.json({ ingested: result.total, chunks: result.chunks });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("POST /api/admin/documents/ingest error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
