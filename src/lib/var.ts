/** @format */

import type { MenuItem, Permission } from "@/interface/type";

export const ValidPath = ["", "users", "roles", "alumni", "articles", "events", "testimonials", "settings", "careers", "categories", "content", "pages", "new", "edit"];

export const LocalToken = "idomain_auth_token";
export const LocalRefreshToken = "idomain_refresh_token";

/**
 * Single source of truth for the sidebar menu.
 * Each item declares the permission required to see it; items with
 * `permission: null` are visible to every authenticated user.
 */
export const AppMenu: MenuItem[] = [
  { id: 1, text: "Home", href: "/", permission: null },
  { id: 2, text: "Users", href: "/users", permission: "user.view" as Permission },
  { id: 3, text: "Roles", href: "/roles", permission: "role.view" as Permission },
  { id: 4, text: "Alumni", href: "/alumni", permission: "alumni.view" as Permission },
  { id: 5, text: "Articles", href: "/articles", permission: "article.view" as Permission },
  { id: 6, text: "Events", href: "/events", permission: "event.view" as Permission },
  { id: 7, text: "Testimonials", href: "/testimonials", permission: "testimonial.view" as Permission },
  { id: 8, text: "Careers", href: "/careers", permission: "career.view" as Permission },
  { id: 9, text: "Categories", href: "/careers/categories", permission: "category.view" as Permission },
  { id: 10, text: "Settings", href: "/settings", permission: "setting.view" as Permission },
];

/**
 * Map a pathname (first segment) to the permission required to view it.
 * Used by the Next.js middleware + RoleGuard for defence-in-depth.
 * Paths not listed here are considered public-among-authenticated.
 */
export const PathPermissionMap: Record<string, Permission> = {
  users: "user.view",
  roles: "role.view",
  alumni: "alumni.view",
  articles: "article.view",
  events: "event.view",
  testimonials: "testimonial.view",
  careers: "career.view",
  categories: "category.view",
  settings: "setting.view",
};

/** @deprecated retained for reference; prefer AppMenu + can() */
export const DefaultMenu = AppMenu;
/** @deprecated retained for reference; prefer AppMenu + can() */
export const SuperMenu = AppMenu;

export const colors = [
  "#135292",
  "#42849E",
  "#C6E5DD",
  "#9BD4BA",
  "#E6E9EE",
  "#EF4444",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
];
