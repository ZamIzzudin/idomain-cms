/** @format */
"use client";

import { useRouter } from "next/navigation";
import { useGlobalState } from "@/lib/middleware";

import { useLogin } from "@/hooks/useAuth";

import Notification from "@/components/Notification";
import { User, Lock, LogIn } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { mutate, isPending } = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      Notification("error", "Please fill in all required fields");
      return;
    }

    mutate(
      { username, password },
      {
        onSuccess() {
          Notification("success", "Login Success");
          router.push("/");
        },
        onError(error: any) {
          Notification("error", error.message || "Login Failed");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            IDOMAIN CMS
          </h1>
          <p className="text-slate-600">Sign in to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-3 h-3" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Secure dashboard access for authorized users only
          </p>
        </div>
      </div>
    </div>
  );
}
