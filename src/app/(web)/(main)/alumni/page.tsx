"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  MapPin,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import Notification from "@/components/Notification";
import {
  useAlumniList,
  useAlumniFilterOptions,
  useDeleteAlumni,
  useApproveAlumni,
  useRejectAlumni,
  useExportAlumni,
  useImportAlumni,
  useDownloadTemplate,
} from "./hook";

const PER_PAGE = 10;

export default function AlumniPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterSpec, setFilterSpec] = useState<string | undefined>(undefined);
  const [filterProvince, setFilterProvince] = useState<string | undefined>(
    undefined,
  );
  const [filterApproval, setFilterApproval] = useState<string>("all");
  const [sort, setSort] = useState("pending_first");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (searchParams.get("filter") === "pending") {
      setFilterApproval("false");
      setSort("pending_first");
      setShowFilters(true);
    }
  }, [searchParams]);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useAlumniList({
    page,
    perPage: PER_PAGE,
    q: debouncedSearch || undefined,
    graduationYear: filterYear,
    specialization: filterSpec,
    province: filterProvince,
    sort,
    approved: filterApproval,
  });

  const { data: filterOptions } = useAlumniFilterOptions();
  const { mutate: deleteAlumni, isPending: deletePending } = useDeleteAlumni();
  const { mutate: approveAlumni } = useApproveAlumni();
  const { mutate: rejectAlumni } = useRejectAlumni();
  const { mutate: exportAlumni, isPending: exportPending } = useExportAlumni();
  const { mutate: importAlumni, isPending: importPending } = useImportAlumni();
  const { mutate: downloadTemplate } = useDownloadTemplate();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportAlumni(undefined, {
      onSuccess: () => {
        Notification("success", "Export berhasil diunduh");
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to export");
      },
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      Notification("error", "Hanya file Excel (.xlsx, .xls) yang diizinkan");
      return;
    }
    setImportResult(null);
    importAlumni(file, {
      onSuccess: (data: any) => {
        setImportResult(data.data);
        Notification("success", data.message || "Import berhasil");
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to import");
      },
    });
  };

  const resetFilters = () => {
    setFilterYear(undefined);
    setFilterSpec(undefined);
    setFilterProvince(undefined);
    setFilterApproval("all");
    setSort("pending_first");
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exportPending}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportResult(null);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => router.push("/alumni/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Alumni
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, specialization, location..."
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
            {(filterYear ||
              filterSpec ||
              filterProvince ||
              filterApproval !== "all") && (
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap">
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
              value={filterProvince ?? ""}
              onChange={(e) => {
                setFilterProvince(e.target.value || undefined);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Provinces</option>
              {filterOptions?.provinces?.map((p) => (
                <option key={p} value={p}>
                  {p}
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
              <option value="pending_first">Pending First</option>
              <option value="newest">Newest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="year_asc">Year (Oldest)</option>
              <option value="year_desc">Year (Newest)</option>
            </select>

            {(filterYear ||
              filterSpec ||
              filterProvince ||
              filterApproval !== "all") && (
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
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[220px]" />
                <col className="w-[200px]" />
                <col className="w-[90px]" />
                <col className="w-[170px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Alumni
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Angkatan
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Lokasi
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
                      colSpan={6}
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
                        <div className="flex items-center gap-3 min-w-0">
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
                          <div className="min-w-0">
                            <span className="font-medium text-slate-800 text-sm truncate block">
                              {item.name}
                            </span>
                            {item.contactNumber && (
                              <span className="text-xs text-slate-400 truncate block">
                                {item.contactNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <span className="truncate block" title={item.email || undefined}>
                          {item.email || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.batch || item.graduationYear}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.province || item.city ? (
                          <span className="flex items-center gap-1 truncate" title={[item.city, item.province].filter(Boolean).join(", ")}>
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {[item.city, item.province]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </span>
                        ) : (
                          "-"
                        )}
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary-600" />
                Import Alumni dari Excel
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Upload file Excel (.xlsx) dengan kolom berikut:
              </p>
              <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                <p>
                  <span className="font-semibold text-slate-800">
                    Nama Lengkap
                  </span>{" "}
                  <span className="text-red-500">*(wajib)</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    Tahun Lulus
                  </span>{" "}
                  <span className="text-red-500">*(wajib)</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Angkatan</span>{" "}
                  <span className="text-slate-400">(opsional)</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    Gelar (Depan)
                  </span>{" "}
                  <span className="text-slate-400">(opsional)</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    Gelar (Belakang)
                  </span>{" "}
                  <span className="text-slate-400">(opsional)</span>
                </p>
              </div>

              <button
                onClick={() => downloadTemplate()}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download template Excel
              </button>
            </div>

            <div>
              <input
                ref={importFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => importFileRef.current?.click()}
                disabled={importPending}
                className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {importPending ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-500">
                      Mengimport...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      Klik untuk upload file Excel
                    </span>
                    <span className="text-xs text-slate-400">
                      Format: .xlsx, .xls
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Import Result */}
            {importResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-green-700">
                  Import berhasil: {importResult.imported} alumni ditambahkan
                </p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-amber-600 mb-1">
                      Error ({importResult.errors.length} baris):
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.errors.map((err: any, idx: number) => (
                        <p key={idx} className="text-xs text-amber-600">
                          Baris {err.row}: {err.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
