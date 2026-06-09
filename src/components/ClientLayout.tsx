"use client";

import { Suspense, ReactNode } from "react";
import { TanstackProvider } from "@/lib/tanstack";
import { Middleware } from "@/lib/middleware";
import { Toaster } from "react-hot-toast";
import LoadingPage from "@/components/LoadingPage";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Middleware>
        <TanstackProvider>
          <Toaster />
          {children}
        </TanstackProvider>
      </Middleware>
    </Suspense>
  );
}
