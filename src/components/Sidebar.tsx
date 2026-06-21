/** @format */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useGlobalState } from "@/lib/middleware";
import { useLogout } from "@/hooks/useAuth";
import { useSiteSettings } from "@/app/(web)/(main)/settings/hook";

import { MenuItem } from "@/interface/type";
import { AppMenu } from "@/lib/var";
import { can } from "@/lib/rbac";

import {
  Home,
  FileText,
  Layers,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  MoveLeft,
  GraduationCap,
  Newspaper,
  CalendarDays,
  Quote,
  Briefcase,
  Tags,
  ShieldCheck,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Home,
  Content: FileText,
  Pages: Layers,
  Users,
  Roles: ShieldCheck,
  Alumni: GraduationCap,
  Articles: Newspaper,
  Events: CalendarDays,
  Testimonials: Quote,
  Careers: Briefcase,
  Categories: Tags,
  Settings,
};

export default function Sidebar() {
  const { state } = useGlobalState();
  const pathname = usePathname();
  const { mutate: logout, isPending: logoutPending } = useLogout();
  const { data: settings } = useSiteSettings();

  const siteName =
    settings?.find((s) => s.key === "site_name")?.value || "iDomain";
  const siteLogo = settings?.find((s) => s.key === "site_logo")?.value;

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter menu items by the current user's permissions
  const menuList = AppMenu.filter(
    (item) => !item.permission || can(state.user, item.permission)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sticky left-0 top-0 h-[100dvh] bg-white border-r border-slate-200 z-50 transition-all duration-300 ${
          isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div
            className={`flex items-center w-full ${
              isCollapsed ? "lg:justify-center" : "justify-between"
            }`}
          >
            <div className="flex gap-3 items-center">
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt={siteName}
                  className={`object-contain ${isCollapsed ? "w-8 h-8" : "h-8 w-auto"}`}
                />
              ) : (
                <div
                  onClick={() => setIsCollapsed(false)}
                  className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white font-bold text-sm">
                    {siteName.charAt(0)}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <span className="font-bold text-slate-800 text-lg truncate">
                  {siteName}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden text-sm lg:block p-2 bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-300"
              >
                <MoveLeft size={10} className="w-4 h-4 text-slate-600" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-3 h-3 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-auto max-h-[65dvh] text-sm">
          {menuList.map((item: MenuItem) => {
            const Icon = iconMap[item.text] || Home;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary-50 text-primary-600 border border-primary-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-primary-600"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.text}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {state?.user?.displayName
                    ? state?.user?.displayName[0]
                    : state?.user?.display_name
                      ? state?.user?.display_name[0]
                      : "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {state.user?.displayName ||
                    state.user?.display_name ||
                    "User"}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {state.user?.roleName || state.user?.role || "user"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            disabled={logoutPending}
            className={`text-xs flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full ${
              isCollapsed ? "lg:justify-center lg:px-2" : ""
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {logoutPending ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-3 h-3" />
            )}
            {!isCollapsed && (
              <span className="font-medium">
                {logoutPending ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-30 p-2 bg-white border border-slate-200 rounded-lg shadow-sm lg:hidden"
      >
        <Menu className="w-3 h-3 text-slate-600" />
      </button>
    </>
  );
}
