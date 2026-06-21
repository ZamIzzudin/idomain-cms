"use client";

import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Edit,
  Trash2,
  X,
  Plus,
  Lock,
  Users as UsersIcon,
  GraduationCap,
} from "lucide-react";
import Notification from "@/components/Notification";
import ConfirmModal from "@/components/ConfirmModal";
import RoleGuard from "@/components/RoleGuard";
import type { RoleItem, PermissionItem } from "@/interface/type";
import {
  useRoleList,
  usePermissionList,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "./hook";

type ModalMode = "NONE" | "ADD" | "UPDATE";

interface FormData {
  id?: number;
  name: string;
  slug: string;
  description: string;
  permissionIds: number[];
  batchScopes: number[];
  batchInput: string;
  isSystem?: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function RolesPageContent() {
  const [modal, setModal] = useState<ModalMode>("NONE");
  const [form, setForm] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    permissionIds: [],
    batchScopes: [],
    batchInput: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data: roles = [], refetch } = useRoleList();
  const { data: permissions = [] } = usePermissionList();
  const { mutate: createRole, isPending: createPending } = useCreateRole();
  const { mutate: updateRole, isPending: updatePending } = useUpdateRole();
  const { mutate: deleteRole, isPending: deletePending } = useDeleteRole();

  // Group permissions by module for the matrix UI
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, PermissionItem[]>();
    for (const p of permissions) {
      const arr = map.get(p.module) ?? [];
      arr.push(p);
      map.set(p.module, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissions]);

  // Does the form currently grant alumni.approve?
  const hasAlumniApprove = useMemo(() => {
    const perm = permissions.find((p) => p.name === "alumni.approve");
    return perm ? form.permissionIds.includes(perm.id) : false;
  }, [form.permissionIds, permissions]);

  const emptyForm: FormData = {
    name: "",
    slug: "",
    description: "",
    permissionIds: [],
    batchScopes: [],
    batchInput: "",
  };

  const togglePermission = (id: number) => {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((p) => p !== id)
        : [...prev.permissionIds, id],
    }));
  };

  const toggleModule = (modulePerms: PermissionItem[]) => {
    const ids = modulePerms.map((p) => p.id);
    const allSelected = ids.every((id) => form.permissionIds.includes(id));
    setForm((prev) => ({
      ...prev,
      permissionIds: allSelected
        ? prev.permissionIds.filter((id) => !ids.includes(id))
        : Array.from(new Set([...prev.permissionIds, ...ids])),
    }));
  };

  const addBatchScope = () => {
    const n = parseInt(form.batchInput, 10);
    if (isNaN(n) || n < 1900 || n > 2100) return;
    setForm((prev) => ({
      ...prev,
      batchScopes: Array.from(new Set([...prev.batchScopes, n])).sort(
        (a, b) => a - b,
      ),
      batchInput: "",
    }));
  };

  const removeBatchScope = (batch: number) => {
    setForm((prev) => ({
      ...prev,
      batchScopes: prev.batchScopes.filter((b) => b !== batch),
    }));
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
    setModal("ADD");
  };

  const openEdit = (role: RoleItem) => {
    setForm({
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description || "",
      permissionIds: role.permissions.map((rp) => rp.permission.id),
      batchScopes: role.batchScopes.map((s) => s.batch).sort((a, b) => a - b),
      batchInput: "",
      isSystem: role.isSystem,
    });
    setModal("UPDATE");
  };

  const handleSubmit = () => {
    if (!form.name) {
      return Notification("error", "Role name is required");
    }

    const slug = form.slug || slugify(form.name);

    // Only send batchScopes when alumni.approve is granted
    const batchScopes =
      hasAlumniApprove && form.batchScopes.length > 0
        ? form.batchScopes
        : hasAlumniApprove
          ? [] // explicit empty = unrestricted
          : undefined; // not granted, omit

    if (modal === "ADD") {
      createRole(
        {
          name: form.name,
          slug,
          description: form.description || undefined,
          permissionIds: form.permissionIds,
          batchScopes,
        },
        {
          onSuccess: () => {
            Notification("success", "Role created successfully");
            setModal("NONE");
            setForm(emptyForm);
            refetch();
          },
          onError: (error: any) => {
            Notification("error", error.message || "Failed to create role");
          },
        },
      );
    } else if (modal === "UPDATE" && form.id) {
      updateRole(
        {
          id: form.id,
          name: form.name,
          description: form.description || undefined,
          permissionIds: form.permissionIds,
          batchScopes,
        },
        {
          onSuccess: () => {
            Notification("success", "Role updated successfully");
            setModal("NONE");
            setForm(emptyForm);
            refetch();
          },
          onError: (error: any) => {
            Notification("error", error.message || "Failed to update role");
          },
        },
      );
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRole(deleteTarget.id, {
      onSuccess: () => {
        Notification("success", "Role deleted successfully");
        refetch();
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete role");
      },
      onSettled: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Roles & Permissions
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage roles and their permission matrix
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No roles found
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">
                        {role.name}
                      </h3>
                      {role.isSystem && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium">
                          <Lock className="w-2.5 h-2.5" />
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{role.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(role)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({ id: role.id, name: role.name })
                    }
                    disabled={role.isSystem || deletePending}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                      role.isSystem ? "System role cannot be deleted" : "Delete"
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {role.description && (
                <p className="text-sm text-slate-500">{role.description}</p>
              )}

              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-3.5 h-3.5" />
                  {role._count?.users ?? 0} user(s)
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {role.permissions.length} permission(s)
                </span>
                {(() => {
                  const hasApprove = role.permissions.some(
                    (rp) => rp.permission.name === "alumni.approve",
                  );
                  if (!hasApprove) return null;
                  const batches = role.batchScopes.map((s) => s.batch).sort();
                  return (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {batches.length === 0
                        ? "Semua angkatan"
                        : `Angkatan ${batches.join(", ")}`}
                    </span>
                  );
                })()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modal !== "NONE" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {modal === "ADD" ? "Add New Role" : "Edit Role"}
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

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug || slugify(e.target.value),
                      }));
                    }}
                    placeholder="e.g. Editor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Slug{" "}
                    {form.isSystem && (
                      <span className="text-slate-400 font-normal text-xs">
                        (locked)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        slug: slugify(e.target.value),
                      }))
                    }
                    disabled={form.isSystem}
                    placeholder="editor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Short description (optional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Batch Scope (only when alumni.approve is granted) */}
              {hasAlumniApprove && (
                <div className="border border-primary-100 bg-primary-50/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-primary-600" />
                    <label className="text-sm font-semibold text-slate-700">
                      Cakupan Angkatan untuk Approval Alumni
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={form.batchInput}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          batchInput: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addBatchScope();
                        }
                      }}
                      placeholder="cth. 2020"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={addBatchScope}
                      className="flex items-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {form.batchScopes.length === 0 ? (
                    <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                      <strong>Catatan:</strong> Kosongkan untuk mengizinkan
                      approval semua angkatan (tanpa batasan). Tambahkan
                      angkatan tertentu untuk membatasi role ini hanya bisa
                      menyetujui alumni dari angkatan tersebut.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {form.batchScopes.map((batch) => (
                        <span
                          key={batch}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-primary-200 text-primary-700 rounded-lg text-xs font-medium"
                        >
                          Angkatan {batch}
                          <button
                            type="button"
                            onClick={() => removeBatchScope(batch)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Permission Matrix */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permissions
                </label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  {groupedPermissions.map(([module, perms]) => {
                    const allSelected = perms.every((p) =>
                      form.permissionIds.includes(p.id),
                    );
                    const someSelected = perms.some((p) =>
                      form.permissionIds.includes(p.id),
                    );
                    return (
                      <div
                        key={module}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el)
                                el.indeterminate = !allSelected && someSelected;
                            }}
                            onChange={() => toggleModule(perms)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            {module}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                          {perms.map((p) => (
                            <label
                              key={p.id}
                              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={form.permissionIds.includes(p.id)}
                                onChange={() => togglePermission(p.id)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-xs text-slate-600">
                                {p.name.replace(`${module}.`, "")}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-slate-200">
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
                onClick={handleSubmit}
                disabled={createPending || updatePending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {createPending || updatePending
                  ? "Loading..."
                  : modal === "ADD"
                    ? "Create Role"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Role"
        message={`Are you sure you want to delete role "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function RolesPage() {
  return (
    <RoleGuard permission="role.view">
      <RolesPageContent />
    </RoleGuard>
  );
}
