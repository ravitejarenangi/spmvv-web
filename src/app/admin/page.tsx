export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { checkOllamaHealth } from "@/lib/generation";
import { checkRerankerHealth } from "@/lib/reranker";
import { StatsCards } from "@/components/admin/StatsCards";

export default async function AdminDashboardPage() {
  const [users, sessions, documents, chunks, ollamaStatus, rerankerStatus] =
    await Promise.all([
      prisma.user.count(),
      prisma.chatSession.count(),
      prisma.document.count(),
      prisma.documentChunk.count(),
      checkOllamaHealth(),
      checkRerankerHealth(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your EDUBOT system.</p>
      </div>
      <StatsCards
        stats={{ users, sessions, documents, chunks, ollamaStatus, rerankerStatus }}
      />
    </div>
  );
}
