"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Tags,
  X,
} from "lucide-react";
import Notification from "@/components/Notification";
import ConfirmModal from "@/components/ConfirmModal";
import {
  useCategoryList,
  useCreateCategory,
  useDeleteCategory,
} from "../hook";

export default function CareerCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"KLINIS" | "NON_KLINIS">("KLINIS");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data: categories, isLoading } = useCategoryList();
  const { mutate: createCategory, isPending: createPending } =
    useCreateCategory();
  const { mutate: deleteCategory, isPending: deletePending } =
    useDeleteCategory();

  const klinisCategories = categories?.filter((c) => c.type === "KLINIS") || [];
  const nonKlinisCategories =
    categories?.filter((c) => c.type === "NON_KLINIS") || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createCategory(
      { name: newName.trim(), type: newType },
      {
        onSuccess: () => {
          Notification("success", "Kategori berhasil ditambahkan");
          setNewName("");
          setShowForm(false);
        },
        onError: (error: any) =>
          Notification("error", error.message || "Gagal menambahkan kategori"),
      }
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id, {
      onSuccess: () => Notification("success", "Kategori berhasil dihapus"),
      onError: (error: any) =>
        Notification("error", error.message || "Gagal menghapus kategori"),
      onSettled: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Tags className="w-6 h-6 text-primary-600" />
            Career Categories
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola kategori lowongan kerja
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl p-4 border border-slate-200 flex items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="contoh: Kardiologi"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tipe
            </label>
            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as "KLINIS" | "NON_KLINIS")
              }
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="KLINIS">Klinis</option>
              <option value="NON_KLINIS">Non-Klinis</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createPending}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {createPending ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setNewName("");
            }}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </form>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Klinis */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">
                Klinis ({klinisCategories.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {klinisCategories.length === 0 ? (
                <p className="py-6 text-center text-slate-400 text-sm">
                  Tidak ada kategori
                </p>
              ) : (
                klinisCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm text-slate-700 font-medium">
                        {cat.name}
                      </p>
                      <p className="text-xs text-slate-400">/{cat.slug}</p>
                    </div>
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: cat.id, name: cat.name })
                      }
                      disabled={deletePending}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Non-Klinis */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">
                Non-Klinis ({nonKlinisCategories.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {nonKlinisCategories.length === 0 ? (
                <p className="py-6 text-center text-slate-400 text-sm">
                  Tidak ada kategori
                </p>
              ) : (
                nonKlinisCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm text-slate-700 font-medium">
                        {cat.name}
                      </p>
                      <p className="text-xs text-slate-400">/{cat.slug}</p>
                    </div>
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: cat.id, name: cat.name })
                      }
                      disabled={deletePending}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"? Kategori yang masih memiliki lowongan tidak dapat dihapus.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
