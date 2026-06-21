/** @format */

import type { Permission, User } from "@/interface/type";

/**
 * Does the user hold a single permission?
 */
export function can(user: User | null, permission: Permission): boolean {
  if (!user?.permissions) return false;
  return user.permissions.includes(permission);
}

/**
 * Does the user hold at least one of the given permissions?
 */
export function canAny(
  user: User | null,
  permissions: Permission[]
): boolean {
  if (!user?.permissions) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Does the user hold ALL of the given permissions?
 */
export function canAll(
  user: User | null,
  permissions: Permission[]
): boolean {
  if (!user?.permissions) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Convenience: is the user a superadmin (by role slug)?
 */
export function isSuperadmin(user: User | null): boolean {
  return user?.role === "superadmin";
}

/**
 * Batch-scoped check for alumni.approve.
 *
 * Rules (mirror backend canApproveAlumni):
 *  - Must hold alumni.approve.
 *  - Unrestricted scope (batchScopes null/undefined) -> can approve any alumni.
 *  - Scoped approver -> only batches in scope; null batch is blocked.
 *
 * Returns true if the user is allowed to approve the given alumni.
 */
export function canApproveAlumni(
  user: User | null,
  alumniBatch: number | null | undefined
): boolean {
  if (!can(user, "alumni.approve")) return false;

  const scope = user?.batchScopes ?? null;

  // Unrestricted approver
  if (scope === null) return true;

  // Alumni without batch: only unrestricted approvers can approve
  if (alumniBatch === null || alumniBatch === undefined) return false;

  return scope.includes(alumniBatch);
}

/**
 * Generic batch-scope check for alumni update/delete.
 *
 * Rules (mirror backend canAccessAlumniByBatch):
 *  - Unrestricted scope (null/undefined) -> full access to ALL alumni.
 *  - Scoped user -> only alumni whose batch is in scope; null batch blocked.
 *
 * Does NOT check the alumni.update / alumni.delete permission itself. The
 * caller is responsible for combining this with the appropriate permission
 * check (e.g. `can(user, "alumni.update") && canAccessAlumniByBatch(...)`).
 */
export function canAccessAlumniByBatch(
  user: User | null,
  alumniBatch: number | null | undefined
): boolean {
  const scope = user?.batchScopes ?? null;

  // Unrestricted user -> full access
  if (scope === null) return true;

  // Alumni without batch: only unrestricted users can modify
  if (alumniBatch === null || alumniBatch === undefined) return false;

  return scope.includes(alumniBatch);
}
