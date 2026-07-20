/**
 * Centralized Role types for the entire application.
 * Replaces all hardcoded "admin" / "user" string literals.
 */

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  user: "Người dùng",
  admin: "Quản trị viên",
} as const;

export function isAdmin(role: string): boolean {
  return role === "admin";
}

export function isValidRole(value: unknown): value is Role {
  return ROLES.includes(value as Role);
}

export function normalizeRole(value: string): Role {
  return isValidRole(value) ? value : "user";
}
