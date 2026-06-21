/** @format */

"use client";

import { useGlobalState } from "@/lib/middleware";
import dynamic from "next/dynamic";
import Link from "next/link";
import CountUp from "@/components/CountUp";
import {
  GraduationCap,
  Clock,
  MapPin,
  Award,
  BarChart3,
  AlertCircle,
  Briefcase,
  Check,
  XCircle,
} from "lucide-react";
import { useAlumniStats } from "@/hooks/useAlumniStats";
import { useCareerList, useApproveCareer, useRejectCareer } from "./careers/hook";
import Notification from "@/components/Notification";
import Can from "@/components/Can";

const CMSAlumniMap = dynamic(() => import("@/components/CMSAlumniMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
      <p className="text-slate-400 text-sm">Memuat peta...</p>
    </div>
  ),
});

export default function Dashboard() {
  const { state } = useGlobalState();
  const { data: stats, isLoading: statsLoading } = useAlumniStats();
  const { data: pendingCareers } = useCareerList({
    status: "PENDING_REVIEW",
    limit: 5,
    sortOrder: "asc",
  });
  const { mutate: approveCareer } = useApproveCareer();
  const { mutate: rejectCareer } = useRejectCareer();

  const pendingItems = pendingCareers?.items || [];
  const pendingTotal = pendingCareers?.total || 0;

  const handleApprove = (id: number) => {
    approveCareer(id, {
      onSuccess: () => Notification("success", "Lowongan dipublikasikan"),
      onError: (e: any) => Notification("error", e.message),
    });
  };

  const handleReject = (id: number) => {
    rejectCareer(id, {
      onSuccess: () => Notification("success", "Lowongan ditolak"),
      onError: (e: any) => Notification("error", e.message),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Selamat datang,{" "}
          <span className="font-semibold text-slate-700">
            {state.user?.display_name || "User"}
          </span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Alumni */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Alumni</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {statsLoading ? (
                  <span className="inline-block w-16 h-8 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <CountUp target={stats?.total ?? 0} />
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-600/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-3">
            <Link
              href="/alumni"
              className="text-xs text-primary-600 font-medium hover:underline"
            >
              Lihat semua alumni →
            </Link>
          </div>
        </div>

        {/* Pending Approval */}
        <div
          className={`rounded-xl border p-5 ${stats && stats.pendingCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Approval</p>
              <p
                className={`text-3xl font-bold mt-1 ${stats && stats.pendingCount > 0 ? "text-amber-600" : "text-slate-800"}`}
              >
                {statsLoading ? (
                  <span className="inline-block w-12 h-8 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <CountUp target={stats?.pendingCount ?? 0} />
                )}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats && stats.pendingCount > 0 ? "bg-amber-100" : "bg-slate-100"}`}
            >
              {stats && stats.pendingCount > 0 ? (
                <AlertCircle className="w-6 h-6 text-amber-500" />
              ) : (
                <Clock className="w-6 h-6 text-slate-400" />
              )}
            </div>
          </div>
          {stats && stats.pendingCount > 0 && (
            <div className="mt-3">
              <Link
                href="/alumni?filter=pending"
                className="text-xs text-amber-600 font-medium hover:underline"
              >
                Perlu ditinjau →
              </Link>
            </div>
          )}
        </div>

        {/* Provinces */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Provinsi Tersebar</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {statsLoading ? (
                  <span className="inline-block w-10 h-8 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <CountUp target={stats?.byProvince?.length ?? 0} />
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Career Approvals */}
      {pendingTotal > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-slate-800">
                Lowongan Menunggu Persetujuan
              </h2>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                {pendingTotal}
              </span>
            </div>
            <Link
              href="/careers"
              className="text-xs text-amber-600 font-medium hover:underline"
            >
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors"
              >
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.institutionName}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-primary-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item.position}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {item.institutionName}
                    {item.author?.name ? ` • oleh ${item.author.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Can permission="career.approve">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-500 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  </Can>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map + Detailed Stats */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary-600" />
              <h2 className="text-sm font-semibold text-slate-800">
                Sebaran Alumni
              </h2>
            </div>
            <CMSAlumniMap data={stats.byProvince} />
          </div>

          {/* Side Stats */}
          <div className="space-y-4">
            {/* Top Provinces */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Provinsi Terbanyak
                </h3>
              </div>
              <div className="space-y-2.5">
                {stats.byProvince.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.province}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-slate-400 w-4 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-sm text-slate-700 truncate">
                        {item.province}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary-600 ml-2 shrink-0">
                      {item.count}
                    </span>
                  </div>
                ))}
                {stats.byProvince.length === 0 && (
                  <p className="text-xs text-slate-400">Belum ada data</p>
                )}
              </div>
            </div>

            {/* Top Specializations */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Spesialisasi Terbanyak
                </h3>
              </div>
              <div className="space-y-2.5">
                {stats.bySpecialization.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.specialization}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-slate-400 w-4 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-sm text-slate-700 truncate">
                        {item.specialization}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 ml-2 shrink-0">
                      {item.count}
                    </span>
                  </div>
                ))}
                {stats.bySpecialization.length === 0 && (
                  <p className="text-xs text-slate-400">Belum ada data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Bento */}
      {!statsLoading && stats && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              Alumni per Angkatan
            </h2>
          </div>
          {(() => {
            const batchData =
              stats.byBatch && stats.byBatch.length > 0
                ? stats.byBatch.slice(-15)
                : stats.byYear.slice(-15);
            const maxCount = Math.max(...batchData.map((y: any) => y.count), 1);
            const getLabel = (item: any) =>
              "batch" in item ? item.batch : item.year;
            const getRank = (item: any) => {
              const ratio = item.count / maxCount;
              if (ratio > 0.75) return 3;
              if (ratio > 0.4) return 2;
              if (ratio > 0.15) return 1;
              return 0;
            };
            const rankSpan: Record<number, string> = {
              3: "col-span-2 row-span-2",
              2: "col-span-2",
              1: "",
              0: "",
            };
            const rankBg: Record<number, string> = {
              3: "bg-primary-600 text-white",
              2: "bg-primary-100 text-primary-700",
              1: "bg-primary-50 text-primary-600",
              0: "bg-slate-50 text-slate-500",
            };
            return (
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 auto-rows-[2rem]">
                {batchData.map((item) => {
                  const label = getLabel(item);
                  const rank = getRank(item);
                  return (
                    <div
                      key={String(label)}
                      className={`rounded-md flex items-center justify-center transition-colors hover:opacity-80 cursor-default ${rankSpan[rank]} ${rankBg[rank]}`}
                      title={`${label}: ${item.count} alumni`}
                    >
                      <span className="text-[10px] font-bold leading-none">
                        {item.count}
                      </span>
                      <span className="text-[8px] opacity-60 leading-none ml-0.5">
                        ({String(label)})
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
