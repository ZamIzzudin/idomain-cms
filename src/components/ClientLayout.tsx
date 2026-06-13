"use client";

import { Suspense, ReactNode, useEffect } from "react";
import { TanstackProvider } from "@/lib/tanstack";
import { Middleware } from "@/lib/middleware";
import { Toaster } from "react-hot-toast";
import LoadingPage from "@/components/LoadingPage";
import { useSiteSettings } from "@/app/(web)/(main)/settings/hook";

function FaviconSync() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const favicon = settings?.find((s: any) => s.key === "site_favicon")?.value;
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [settings]);

  return null;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Middleware>
        <TanstackProvider>
          <FaviconSync />
          <Toaster />
          {children}
        </TanstackProvider>
      </Middleware>
    </Suspense>
  );
}
