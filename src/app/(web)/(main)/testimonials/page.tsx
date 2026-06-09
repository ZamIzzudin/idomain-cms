"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight,
  Quote, Building2,
} from "lucide-react";
import Notification from "@/components/Notification";
import { useTestimonialList, useDeleteTestimonial } from "./hook";

const PER_PAGE = 10;

export default function TestimonialsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useTestimonialList({
    page, limit: PER_PAGE, search: debouncedSearch || undefined, sortOrder: sortOrder as any,
  });
  const { mutate: deleteTestimonial, isPending: deletePending } = useDeleteTestimonial();

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    deleteTestimonial(id, {
      onSuccess: () => Notification("success", "Testimonial deleted successfully"),
      onError: (error: any) => Notification("error", error.message || "Failed to delete"),
    });
  };

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Quote className="w-6 h-6 text-primary-600" />
            Testimonials
          </h1>
          <p className="text-slate-500 text-sm mt-1">{total} testimonial{total !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={() => router.push("/testimonials/new")} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, institution, testimonial..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
          </div>
          <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {[1, 2, 3].map((i) => (<div key={i} className="h-14 bg-slate-100 rounded-lg" />))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Institution</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Testimonial</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No testimonials found</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-600/10 rounded-full flex items-center justify-center shrink-0">
                            {item.photo ? (
                              <img src={item.photo} alt={item.name} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <span className="text-primary-600 font-medium text-sm">{item.name[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {item.institution ? (
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" />{item.institution}</span>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 max-w-[300px]">
                        <p className="line-clamp-2">{item.testimonial}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/testimonials/${item.id}/edit`)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4 text-slate-500" /></button>
                          <button onClick={() => handleDelete(item.id)} disabled={deletePending} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">Page {page} of {totalPages} ({total} records)</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pn: number;
                  if (totalPages <= 5) pn = i + 1;
                  else if (page <= 3) pn = i + 1;
                  else if (page >= totalPages - 2) pn = totalPages - 4 + i;
                  else pn = page - 2 + i;
                  return (<button key={pn} onClick={() => setPage(pn)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pn ? "bg-primary-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>{pn}</button>);
                })}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
