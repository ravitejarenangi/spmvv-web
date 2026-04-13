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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Upload and manage knowledge base documents.</p>
      </div>
      <DocumentManager initialDocuments={serialized} />
    </div>
  );
}
