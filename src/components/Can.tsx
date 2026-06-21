/** @format */
"use client";

import { ReactNode } from "react";
import { useGlobalState } from "@/lib/middleware";
import { can, canAny } from "@/lib/rbac";
import type { Permission } from "@/interface/type";

interface CanProps {
  permission?: Permission;
  anyOf?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on the current user's permissions.
 *
 * Usage:
 *   <Can permission="user.create"><Button>Add</Button></Can>
 *   <Can anyOf={["user.update","user.delete"]}><Actions/></Can>
 */
export default function Can({
  permission,
  anyOf,
  children,
  fallback = null,
}: CanProps) {
  const { state } = useGlobalState();
  const allowed = permission
    ? can(state.user, permission)
    : anyOf
      ? canAny(state.user, anyOf)
      : true;

  return <>{allowed ? children : fallback}</>;
}
