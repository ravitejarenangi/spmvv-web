"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="grid gap-4 sm:grid-cols-2">
      {roles.map((role) => {
        const isEditing = editingId === role.id;
        const activePerms = isEditing
          ? draftPerms
          : role.permissions.filter((p) => p.granted).map((p) => p.permission);

        return (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{role.name}</CardTitle>
                {role.isSystem && <Badge variant="secondary">System</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">
                {role._count.users} user{role._count.users !== 1 ? "s" : ""}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}
              <div className="space-y-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <div key={perm} className="flex items-center gap-2">
                    <Checkbox
                      id={`${role.id}-${perm}`}
                      checked={activePerms.includes(perm)}
                      disabled={!isEditing}
                      onCheckedChange={() => isEditing && togglePerm(perm)}
                    />
                    <Label
                      htmlFor={`${role.id}-${perm}`}
                      className="text-xs font-mono cursor-pointer"
                    >
                      {perm}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={() => savePermissions(role.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEdit(role)}>
                    Edit Permissions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
