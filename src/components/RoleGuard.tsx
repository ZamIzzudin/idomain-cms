/** @format */
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalState } from "@/lib/middleware";
import { can, canAny } from "@/lib/rbac";
import type { Permission } from "@/interface/type";
import LoadingPage from "@/components/LoadingPage";

interface RoleGuardProps {
  permission?: Permission;
  anyOf?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Page-level guard. Redirects (or renders fallback) when the current
 * user lacks the required permission. Replaces inline
 * `if (user.role !== "SUPERADMIN") router.push("/")` patterns.
 */
export default function RoleGuard({
  permission,
  anyOf,
  children,
  fallback,
  redirectTo = "/",
}: RoleGuardProps) {
  const { state } = useGlobalState();
  const router = useRouter();

  const allowed = permission
    ? can(state.user, permission)
    : anyOf
      ? canAny(state.user, anyOf)
      : true;

  useEffect(() => {
    if (!state.isLoading && !allowed && redirectTo) {
      router.replace(redirectTo);
    }
  }, [state.isLoading, allowed, redirectTo, router]);

  if (state.isLoading) return <LoadingPage />;

  if (!allowed) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}
