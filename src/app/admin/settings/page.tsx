export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const [settings, domains] = await Promise.all([
    prisma.setting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    }),
    prisma.allowedDomain.findMany({ orderBy: { domain: "asc" } }),
  ]);

  const serializedSettings = settings.map((s) => ({
    ...s,
    updatedAt: s.updatedAt.toISOString(),
  }));

  const serializedDomains = domains.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure system settings and allowed domains.</p>
      </div>
      <SettingsForm initialSettings={serializedSettings} initialDomains={serializedDomains} />
    </div>
  );
}
