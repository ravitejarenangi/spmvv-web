export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { RoleEditor } from "@/components/admin/RoleEditor";

export default async function AdminRolesPage() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });

  const serialized = roles.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    permissions: r.permissions.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
        <p className="text-muted-foreground">Manage role permissions.</p>
      </div>
      <RoleEditor initialRoles={serialized} />
    </div>
  );
}
