/** @format */

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import ClientLayout from "@/components/ClientLayout";

import "@/styles/globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMS iDomain",
  description: "[INTERNAL USAGE] Content Management System (CMS)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakartaSans.className}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
