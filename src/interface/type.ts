/** @format */

// ============================================================
// RBAC types
// ============================================================

/** All permission keys known to the system. Keep in sync with backend seed. */
export type Permission =
  | "user.view" | "user.create" | "user.update" | "user.delete"
  | "role.view" | "role.create" | "role.update" | "role.delete"
  | "alumni.view" | "alumni.create" | "alumni.update" | "alumni.delete" | "alumni.approve"
  | "article.view" | "article.create" | "article.update" | "article.delete"
  | "event.view" | "event.create" | "event.update" | "event.delete"
  | "testimonial.view" | "testimonial.create" | "testimonial.update" | "testimonial.delete"
  | "career.view" | "career.create" | "career.update" | "career.delete" | "career.approve"
  | "category.view" | "category.create" | "category.update" | "category.delete"
  | "setting.view" | "setting.update";

export interface User {
  id: number;
  username: string;
  displayName?: string;
  display_name?: string;
  role: string;        // role slug, e.g. "superadmin", "admin"
  roleName?: string;   // human-friendly label, e.g. "Superadmin"
  roleId?: number;
  permissions: Permission[];
  // null = unrestricted (can approve any batch, including null)
  // number[] = scoped to specific batches only
  // undefined = legacy, treat as unrestricted
  batchScopes?: number[] | null;
  access_token?: string;
}

export interface RoleItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  _count?: { users: number };
  permissions: { permission: { id: number; name: string } }[];
  batchScopes: { batch: number }[];
}

export interface PermissionItem {
  id: number;
  name: string;
  description: string | null;
  module: string;
}

// ============================================================
// Global state
// ============================================================

export interface GlobalState {
  hasLogin: boolean;
  user: User | null;
  token?: string;
  isLoading: boolean;
}

export interface GlobalActions {
  setAuth: (user: User | null, token: string) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export interface GlobalProviderProps {
  state: GlobalState;
  actions: GlobalActions;
}

export type Actions =
  | { type: "SET_AUTH"; payload: { user: User | null; tokens?: { access_token?: string } } }
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGOUT" };

export interface MenuItem {
  id: number;
  text: string;
  icon?: any;
  href: string;
  permission?: Permission | null;
}
