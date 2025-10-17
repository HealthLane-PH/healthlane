"use client";

import { AuthProvider } from "./context/AuthContext";
import ClientOnly from "./components/ClientOnly";
import { ToastConfig } from "@/components/ToastConfig";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <AuthProvider>
        {children}
        <ToastConfig />
      </AuthProvider>
    </ClientOnly>
  );
}