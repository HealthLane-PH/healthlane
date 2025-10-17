"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastConfig } from "@/components/ToastConfig";

export default function RootWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // skip public wrapper for these sections
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/auth");
  const isStaff = pathname.startsWith("/staff");

  // special layouts (barebone, no header/footer)
  if (isDashboard || isStaff) {
    return (
      <>
        {children}
        <ToastConfig />
      </>
    );
  }

  // public site wrapper
  return (
    <>
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 bg-grayBg min-h-screen">
        {children}
      </main>

      <Footer />
      <ToastConfig />
    </>
  );
}