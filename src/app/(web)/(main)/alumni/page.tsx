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
  GraduationCap,
  Check,
  XCircle,
} from "lucide-react";
import Notification from "@/components/Notification";
import {
  useAlumniList,
  useAlumniFilterOptions,
  useDeleteAlumni,
  useApproveAlumni,
  useRejectAlumni,
} from "./hook";

const PER_PAGE = 10;

export default function AlumniPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterSpec, setFilterSpec] = useState<string | undefined>(undefined);
  const [filterApproval, setFilterApproval] = useState<string>("all");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useAlumniList({
    page,
    perPage: PER_PAGE,
    q: debouncedSearch || undefined,
    graduationYear: filterYear,
    specialization: filterSpec,
    sort,
    approved: filterApproval !== "all" ? filterApproval : undefined,
  });

  const { data: filterOptions } = useAlumniFilterOptions();
  const { mutate: deleteAlumni, isPending: deletePending } = useDeleteAlumni();
  const { mutate: approveAlumni } = useApproveAlumni();
  const { mutate: rejectAlumni } = useRejectAlumni();

  const resetFilters = () => {
    setFilterYear(undefined);
    setFilterSpec(undefined);
    setFilterApproval("all");
    setSort("newest");
    setPage(1);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this alumni?")) return;
    deleteAlumni(id, {
      onSuccess: () => {
        Notification("success", "Alumni deleted successfully");
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete alumni");
      },
    });
  };

  const handleApprove = (id: number) => {
    approveAlumni(id, {
      onSuccess: () => {
        Notification("success", "Alumni approved successfully");
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to approve alumni");
      },
    });
  };

  const handleReject = (id: number) => {
    if (!confirm("Are you sure you want to reject this alumni?")) return;
    rejectAlumni(id, {
      onSuccess: () => {
        Notification("success", "Alumni rejected");
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to reject alumni");
      },
    });
  };

  const alumni = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            Alumni
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} alumni record{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => router.push("/alumni/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Alumni
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, institution, specialization..."
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
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
              showFilters
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterYear || filterSpec || filterApproval !== "all") && (
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <select
              value={filterApproval}
              onChange={(e) => {
                setFilterApproval(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending Approval</option>
            </select>

            <select
              value={filterYear ?? ""}
              onChange={(e) => {
                setFilterYear(
                  e.target.value ? Number(e.target.value) : undefined,
                );
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Years</option>
              {filterOptions?.years?.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={filterSpec ?? ""}
              onChange={(e) => {
                setFilterSpec(e.target.value || undefined);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Specializations</option>
              {filterOptions?.specializations?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="year_asc">Year (Oldest)</option>
              <option value="year_desc">Year (Newest)</option>
            </select>

            {(filterYear || filterSpec || filterApproval !== "all") && (
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
                    Alumni
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Year
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Degree
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Specialization
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumni.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-400 text-sm"
                    >
                      No alumni found
                    </td>
                  </tr>
                ) : (
                  alumni.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-600/10 rounded-full flex items-center justify-center shrink-0">
                            {item.photo ? (
                              <img
                                src={item.photo}
                                alt={item.name}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-primary-600 font-medium text-sm">
                                {item.name[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 text-sm truncate max-w-[200px] block">
                              {item.name}
                            </span>
                            {item.contactNumber && (
                              <span className="text-xs text-slate-400">
                                {item.contactNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.email || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.graduationYear}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.degree || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.specialization || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {item.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            <Check className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            <XCircle className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {!item.isApproved && (
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          {item.isApproved && (
                            <button
                              onClick={() => handleReject(item.id)}
                              className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-amber-500" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              router.push(`/alumni/${item.id}/edit`)
                            }
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? "bg-primary-600 text-white"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      {pageNum}
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
    </div>
  );
}
