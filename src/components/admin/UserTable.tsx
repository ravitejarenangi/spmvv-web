"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: { id: string; name: string };
}

interface Role {
  id: string;
  name: string;
}

interface UserTableProps {
  initialUsers: User[];
  roles: Role[];
}

function roleBadgeClass(roleName: string): string {
  const name = roleName.toLowerCase();
  if (name === "admin") return "bg-blue-100 text-blue-700 border-blue-200";
  if (name === "faculty") return "bg-green-100 text-green-700 border-green-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UserTable({ initialUsers, roles }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function updateUser(id: string, payload: { roleId?: string; isActive?: boolean }) {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message ?? "Failed to update user");
    }
    const data = await res.json();
    return data.user as User;
  }

  async function handleRoleChange(userId: string, roleId: string | null) {
    if (!roleId) return;
    try {
      const updated = await updateUser(userId, { roleId });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      setEditingRoleId(null);
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleStatusToggle(user: User) {
    try {
      const updated = await updateUser(user.id, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: updated.isActive } : u))
      );
      toast.success(updated.isActive ? "User activated" : "User deactivated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg border-slate-200 bg-white focus-visible:ring-blue-500"
          />
        </div>
        <span className="text-sm text-slate-500 font-medium">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-600 py-3">
                User
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-600 py-3">
                Role
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-600 py-3">
                Status
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-600 py-3">
                Joined
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-600 py-3 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Users className="h-10 w-10 opacity-30" />
                    <span className="text-sm font-medium">No users found</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
              >
                {/* Name + email */}
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell className="py-3">
                  {editingRoleId === user.id ? (
                    <Select
                      value={user.role.id}
                      onValueChange={(val) => handleRoleChange(user.id, val)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadgeClass(user.role.name)}`}
                    >
                      {user.role.name}
                    </span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-slate-300"}`}
                    />
                    <span className={`text-sm ${user.isActive ? "text-green-700" : "text-slate-500"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>

                {/* Joined */}
                <TableCell className="py-3 text-sm text-slate-500">
                  {formatDate(user.createdAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Edit role */}
                    <button
                      onClick={() =>
                        setEditingRoleId(editingRoleId === user.id ? null : user.id)
                      }
                      title="Edit role"
                      className="cursor-pointer h-9 w-9 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-500 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Toggle status */}
                    <button
                      onClick={() => handleStatusToggle(user)}
                      title={user.isActive ? "Deactivate user" : "Activate user"}
                      className="cursor-pointer h-9 w-9 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-500 hover:text-blue-600"
                    >
                      {user.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(user.id)}
                      title="Delete user"
                      className="cursor-pointer h-9 w-9 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
