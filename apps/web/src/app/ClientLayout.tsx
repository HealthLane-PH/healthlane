"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import ClientOnly from "./components/ClientOnly";
import { ToastConfig } from "../components/ToastConfig";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname?.startsWith("/staff");

  return (
    <ClientOnly>
      <AuthProvider>
        {!isStaffRoute && <Header />}
        <main className={!isStaffRoute ? "pt-[64px]" : ""}>
          <div className={!isStaffRoute ? "mx-auto max-w-7xl px-6" : ""}>
            {children}
          </div>
        </main>
        {!isStaffRoute && <Footer />}
        <ToastConfig />
      </AuthProvider>
    </ClientOnly>
  );
}