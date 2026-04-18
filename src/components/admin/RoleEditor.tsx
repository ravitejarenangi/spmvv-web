"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Users, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ALL_PERMISSIONS = [
  "admin:dashboard",
  "admin:users:read",
  "admin:users:write",
  "admin:users:delete",
  "admin:roles:read",
  "admin:roles:write",
  "admin:documents:read",
  "admin:documents:write",
  "admin:documents:delete",
  "admin:settings:read",
  "admin:settings:write",
];

const PERMISSION_GROUPS: { label: string; prefix: string }[] = [
  { label: "Chat Permissions", prefix: "chat:" },
  { label: "Content Permissions", prefix: "pdf:" },
  { label: "Admin Permissions", prefix: "admin:" },
];

function groupPermissions(perms: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    "Chat Permissions": [],
    "Content Permissions": [],
    "Admin Permissions": [],
    Other: [],
  };
  for (const p of perms) {
    if (p.startsWith("chat:")) groups["Chat Permissions"].push(p);
    else if (p.startsWith("pdf:")) groups["Content Permissions"].push(p);
    else if (p.startsWith("admin:")) groups["Admin Permissions"].push(p);
    else groups["Other"].push(p);
  }
  return groups;
}

function permLabel(perm: string): string {
  return perm.split(":").slice(1).join(" › ") || perm;
}

interface RolePermission {
  id: string;
  permission: string;
  granted: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: RolePermission[];
  _count: { users: number };
}

interface RoleEditorProps {
  initialRoles: Role[];
}

export function RoleEditor({ initialRoles }: RoleEditorProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPerms, setDraftPerms] = useState<string[]>([]);

  function startEdit(role: Role) {
    setEditingId(role.id);
    setDraftPerms(
      role.permissions.filter((p) => p.granted).map((p) => p.permission)
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftPerms([]);
  }

  function togglePerm(perm: string) {
    setDraftPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  async function savePermissions(roleId: string) {
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roleId, permissions: draftPerms }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to save permissions");
      }
      const data = await res.json();
      setRoles((prev) =>
        prev.map((r) => (r.id === roleId ? { ...r, permissions: data.role.permissions } : r))
      );
      setEditingId(null);
      toast.success("Permissions saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      {roles.map((role) => {
        const isEditing = editingId === role.id;
        const activePerms = isEditing
          ? draftPerms
          : role.permissions.filter((p) => p.granted).map((p) => p.permission);

        const grouped = groupPermissions(ALL_PERMISSIONS);

        return (
          <div
            key={role.id}
            className="glass-panel rounded-xl shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-slate-900 font-[Poppins,sans-serif]">
                      {role.name}
                    </h3>
                    {role.isSystem && (
                      <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium hover:bg-slate-100">
                        System
                      </Badge>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>{role._count.users}</span>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => startEdit(role)}
                    className="cursor-pointer h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-500 hover:text-blue-600"
                    title="Edit permissions"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Permissions body */}
            <div className="px-5 py-4 space-y-5">
              {Object.entries(grouped).map(([groupLabel, perms]) => {
                if (perms.length === 0) return null;
                return (
                  <div key={groupLabel}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {groupLabel}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {perms.map((perm) => {
                        const checked = activePerms.includes(perm);
                        return (
                          <div
                            key={perm}
                            className={`rounded-lg border p-3 transition-colors ${
                              checked
                                ? "bg-blue-50 border-blue-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Checkbox
                                id={`${role.id}-${perm}`}
                                checked={checked}
                                disabled={!isEditing}
                                onCheckedChange={() => isEditing && togglePerm(perm)}
                                className={`mt-0.5 ${
                                  checked
                                    ? "border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    : ""
                                }`}
                              />
                              <Label
                                htmlFor={`${role.id}-${perm}`}
                                className={`text-xs leading-tight cursor-pointer select-none ${
                                  checked ? "text-blue-700 font-medium" : "text-slate-500"
                                } ${!isEditing ? "cursor-default" : ""}`}
                              >
                                {permLabel(perm)}
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer actions */}
            {isEditing && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => savePermissions(role.id)}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="cursor-pointer px-4 py-2 rounded-lg border border-slate-300 hover:bg-white text-slate-600 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
