"use client";

import { useState } from "react";
import { useGlobalState } from "@/lib/middleware";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Edit,
  Trash2,
  X,
  UserPlus,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Notification from "@/components/Notification";
import dayjs from "dayjs";
import {
  useUserList,
  useRegisterUser,
  useUpdateUser,
  useDeleteUser,
} from "./hook";

type ModalMode = "NONE" | "ADD" | "UPDATE";

interface FormData {
  id?: number;
  username: string;
  displayName: string;
  password: string;
  retypePassword: string;
  role: string;
}

const emptyForm: FormData = {
  username: "",
  displayName: "",
  password: "",
  retypePassword: "",
  role: "ADMIN",
};

const PER_PAGE = 10;

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showFilters, setShowFilters] = useState(false);
  const [modal, setModal] = useState<ModalMode>("NONE");
  const [form, setForm] = useState<FormData>(emptyForm);

  const router = useRouter();
  const { state } = useGlobalState();

  const debouncedSearch = useDebounce(searchTerm);

  const { data, isLoading, refetch } = useUserList({
    page,
    limit: PER_PAGE,
    search: debouncedSearch || undefined,
    role: filterRole,
    sortOrder,
    sortBy,
  });
  const { mutate: registerUser, isPending: registerPending } =
    useRegisterUser();
  const { mutate: updateUser, isPending: updatePending } = useUpdateUser();
  const { mutate: deleteUser, isPending: deletePending } = useDeleteUser();

  const users = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilterRole(undefined);
    setSortOrder("desc");
    setSortBy("createdAt");
    setPage(1);
  };

  const handleAdd = () => {
    if (!form.username || !form.displayName || !form.password) {
      return Notification("error", "Please fill in all required fields");
    }
    if (form.password !== form.retypePassword) {
      return Notification("error", "Passwords do not match");
    }

    registerUser(
      {
        username: form.username,
        password: form.password,
        displayName: form.displayName,
      },
      {
        onSuccess: () => {
          Notification("success", "User registered successfully");
          setModal("NONE");
          setForm(emptyForm);
          refetch();
        },
        onError: (error: any) => {
          Notification("error", error.message || "Failed to register user");
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!form.id) return;

    const payload: any = {
      id: form.id,
      username: form.username,
      displayName: form.displayName,
      role: "ADMIN",
    };

    if (form.password) {
      if (form.password !== form.retypePassword) {
        return Notification("error", "Passwords do not match");
      }
      payload.password = form.password;
    }

    updateUser(payload, {
      onSuccess: () => {
        Notification("success", "User updated successfully");
        setModal("NONE");
        setForm(emptyForm);
        refetch();
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to update user");
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    deleteUser(id, {
      onSuccess: () => {
        Notification("success", "User deleted successfully");
        refetch();
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete user");
      },
    });
  };

  const openEdit = (user: any) => {
    setForm({
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.display_name || "",
      password: "",
      retypePassword: "",
      role: "ADMIN",
    });
    setModal("UPDATE");
  };

  // Role guard
  if (!state.user || state.user.role !== "SUPERADMIN") {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} user{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setModal("ADD");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? "border-primary-300 bg-primary-50 text-primary-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {filterRole && (
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <select
              value={filterRole ?? ""}
              onChange={(e) => {
                setFilterRole(e.target.value || undefined);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="SUPERADMIN">Superadmin</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="username">Sort by Username</option>
              <option value="displayName">Sort by Name</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            {filterRole && (
              <button
                onClick={resetFilters}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    User
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Created
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-slate-400 text-sm"
                    >
                      {searchTerm
                        ? "No users found matching your search"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-600/10 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {(user.displayName ||
                                user.display_name ||
                                "U")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {user.displayName || user.display_name || "-"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "SUPERADMIN"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-500">
                        {dayjs(user.createdAt || user.created_at).format(
                          "DD MMM YYYY",
                        )}
                      </td>
                      {user.role !== "SUPERADMIN" ? (
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(user)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletePending}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className="py-3 px-5" />
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages} ({total} records)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pn: number;
                  if (totalPages <= 5) pn = i + 1;
                  else if (page <= 3) pn = i + 1;
                  else if (page >= totalPages - 2) pn = totalPages - 4 + i;
                  else pn = page - 2 + i;
                  return (
                    <button
                      key={pn}
                      onClick={() => setPage(pn)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pn ? "bg-primary-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}
                    >
                      {pn}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {modal !== "NONE" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {modal === "ADD" ? "Add New User" : "Update User"}
              </h2>
              <button
                onClick={() => {
                  setModal("NONE");
                  setForm(emptyForm);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => updateField("displayName", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password{" "}
                  {modal === "UPDATE" && (
                    <span className="text-slate-400 font-normal text-xs">
                      (leave blank to keep)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder={
                    modal === "UPDATE" ? "Enter new password" : "Enter password"
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Retype Password */}
              {form.password && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={form.retypePassword}
                    onChange={(e) =>
                      updateField("retypePassword", e.target.value)
                    }
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setModal("NONE");
                  setForm(emptyForm);
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={modal === "ADD" ? handleAdd : handleUpdate}
                disabled={registerPending || updatePending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {registerPending || updatePending
                  ? "Loading..."
                  : modal === "ADD"
                    ? "Add User"
                    : "Update User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
