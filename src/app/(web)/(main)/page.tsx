/** @format */

"use client";

import { useGlobalState } from "@/lib/middleware";

export default function Dashboard() {
  const { state } = useGlobalState();

  return (
    <div className="space-y-8 flex flex-col items-center justify-center min-h-[90dvh]">
      <div className="flex flex-col items-center">
        <h1 className="text-[60px] font-bold text-slate-800">IDOMAIN</h1>
        <p className="text-slate-600 mt-1">Manage Your Website Content Here</p>
      </div>

      <div className="text-center text-slate-400">
        <p>
          Welcome, <span className="font-semibold text-slate-600">{state.user?.display_name || "User"}</span>
        </p>
        <p className="text-sm mt-1 capitalize">
          Role: {state.user?.role?.toLowerCase() || "admin"}
        </p>
      </div>
    </div>
  );
}
