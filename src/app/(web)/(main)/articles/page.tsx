"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Eye,
  EyeOff,
  Archive,
} from "lucide-react";
import Notification from "@/components/Notification";
import ConfirmModal from "@/components/ConfirmModal";
import {
  useArticleList,
  useArticleFilterOptions,
  useDeleteArticle,
} from "./hook";

const PER_PAGE = 10;

const statusColor: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

const statusIcon: Record<string, any> = {
  DRAFT: EyeOff,
  PUBLISHED: Eye,
  ARCHIVED: Archive,
};

export default function ArticlesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const [filterTag, setFilterTag] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useArticleList({
    page,
    limit: PER_PAGE,
    search: debouncedSearch || undefined,
    status: filterStatus,
    tag: filterTag,
    sortOrder: sortOrder as any,
  });

  const { data: filterOptions } = useArticleFilterOptions();
  const { mutate: deleteArticle, isPending: deletePending } =
    useDeleteArticle();

  const resetFilters = () => {
    setFilterStatus(undefined);
    setFilterTag(undefined);
    setSortOrder("desc");
    setPage(1);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteArticle(deleteTarget.id, {
      onSuccess: () => Notification("success", "Article berhasil dihapus"),
      onError: (error: any) =>
        Notification("error", error.message || "Gagal menghapus article"),
      onSettled: () => setDeleteTarget(null),
    });
  };

  const articles = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            Articles
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} article{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => router.push("/articles/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, content, author..."
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
            {(filterStatus || filterTag) && (
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
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={filterTag ?? ""}
              onChange={(e) => {
                setFilterTag(e.target.value || undefined);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Tags</option>
              {filterOptions?.tags?.map((t) => (
                <option key={t} value={t}>
                  {t}
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
            {(filterStatus || filterTag) && (
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
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Author
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Tags
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Views
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-slate-400 text-sm"
                    >
                      No articles found
                    </td>
                  </tr>
                ) : (
                  articles.map((item) => {
                    const StatusIcon = statusIcon[item.status] || EyeOff;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.featuredImage ? (
                              <img
                                src={item.featuredImage}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="w-3 h-3 text-primary-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 text-sm truncate max-w-[250px]">
                                {item.title}
                              </p>
                              {item.excerpt && (
                                <p className="text-xs text-slate-400 truncate max-w-[250px]">
                                  {item.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusColor[item.status] || statusColor.DRAFT}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {item.author}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            {item.tags?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags?.length > 2 && (
                              <span className="text-xs text-slate-400">
                                +{item.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {item.views}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                router.push(`/articles/${item.id}/edit`)
                              }
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                              disabled={deletePending}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
        title="Hapus Article"
        message={`Apakah Anda yakin ingin menghapus article "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
