"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Filter,
  Briefcase,
  Check,
  XCircle,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import Notification from "@/components/Notification";
import ConfirmModal from "@/components/ConfirmModal";
import Can from "@/components/Can";
import {
  useCareerList,
  useApproveCareer,
  useRejectCareer,
  useDeleteCareer,
  useCategoryList,
} from "./hook";

const PER_PAGE = 10;

const statusColor: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PENDING_REVIEW: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-600",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  EXPIRED: "Expired",
};

export default function CareersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const [filterCategory, setFilterCategory] = useState<string | undefined>(
    undefined,
  );
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useCareerList({
    page,
    limit: PER_PAGE,
    search: debouncedSearch || undefined,
    status: filterStatus,
    sortOrder: sortOrder as any,
  });

  const { data: categories } = useCategoryList();

  const { mutate: approveCareer, isPending: approvePending } =
    useApproveCareer();
  const { mutate: rejectCareer, isPending: rejectPending } =
    useRejectCareer();
  const { mutate: deleteCareer, isPending: deletePending } =
    useDeleteCareer();

  const resetFilters = () => {
    setFilterStatus(undefined);
    setFilterCategory(undefined);
    setSortOrder("desc");
    setPage(1);
  };

  const handleApprove = (id: number) => {
    approveCareer(id, {
      onSuccess: () => {
        Notification("success", "Lowongan berhasil dipublikasikan");
      },
      onError: (error: any) =>
        Notification("error", error.message || "Gagal approve lowongan"),
    });
  };

  const handleReject = (id: number) => {
    rejectCareer(id, {
      onSuccess: () => {
        Notification("success", "Lowongan ditolak, kembali ke Draft");
      },
      onError: (error: any) =>
        Notification("error", error.message || "Gagal reject lowongan"),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCareer(deleteTarget.id, {
      onSuccess: () => Notification("success", "Lowongan berhasil dihapus"),
      onError: (error: any) =>
        Notification("error", error.message || "Gagal menghapus lowongan"),
      onSettled: () => setDeleteTarget(null),
    });
  };

  const careers = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-600" />
            Career Opportunities
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} lowongan total
          </p>
        </div>
        <button
          onClick={() => router.push("/careers/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Career
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, position, institution..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
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
            {(filterStatus || filterCategory) && (
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <select
              value={filterStatus ?? ""}
              onChange={(e) => {
                setFilterStatus(e.target.value || undefined);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <select
              value={filterCategory ?? ""}
              onChange={(e) => {
                setFilterCategory(e.target.value || undefined);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            {(filterStatus || filterCategory) && (
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Lowongan
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Kategori
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Poster
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {careers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-slate-400 text-sm"
                    >
                      No careers found
                    </td>
                  </tr>
                ) : (
                  careers.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.institutionName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center shrink-0">
                              <Building2 className="w-3 h-3 text-primary-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate max-w-[250px]">
                              {item.position}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[250px]">
                              {item.institutionName}
                            </p>
                            {(item.province || item.city) && (
                              <p className="text-xs text-slate-400 truncate max-w-[250px] flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {[item.city, item.province].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusColor[item.status] || statusColor.DRAFT}`}
                        >
                          {statusLabel[item.status] || item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {item.category?.name || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div>
                          <p>{item.author?.name || "-"}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push(`/careers/${item.id}/edit`)
                            }
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <Can permission="career.approve">
                            {item.status === "PENDING_REVIEW" && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  disabled={approvePending}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approve & Publish"
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  disabled={rejectPending}
                                  className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4 text-orange-500" />
                                </button>
                              </>
                            )}
                            {item.status === "DRAFT" && (
                              <button
                                onClick={() => handleApprove(item.id)}
                                disabled={approvePending}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Publish"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                            )}
                          </Can>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: item.id,
                                title: item.position,
                              })
                            }
                            disabled={deletePending}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Lowongan"
        message={`Apakah Anda yakin ingin menghapus lowongan "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
