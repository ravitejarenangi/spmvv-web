import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requirePermission(permission: string) {
  const session = await requireAuth();
  if (!session.user.permissions.includes(permission)) {
    throw new Error("Forbidden");
  }
  return session;
}

export function hasPermission(permissions: string[], required: string): boolean {
  return permissions.includes(required);
}
