export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { DocumentManager } from "@/components/admin/DocumentManager";

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    include: {
      uploader: { select: { id: true, name: true, email: true } },
      _count: { select: { chunks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = documents.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-slate-900"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Document Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload, manage, and ingest documents for the knowledge base
        </p>
      </div>
      <DocumentManager initialDocuments={serialized} />
    </div>
  );
}
