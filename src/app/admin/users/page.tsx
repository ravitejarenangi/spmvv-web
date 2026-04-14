export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { UserTable } from "@/components/admin/UserTable";

export default async function AdminUsersPage() {
  const [rawUsers, roles] = await Promise.all([
    prisma.user.findMany({
      include: { role: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  const users = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    password: "",
  }));

  const serializedRoles = roles.map((r) => ({
    id: r.id,
    name: r.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-[Poppins,sans-serif]">
          User Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage registered users and their roles
        </p>
      </div>
      <UserTable initialUsers={users} roles={serializedRoles} />
    </div>
  );
}
