"use client";
import { AuthProvider } from "./context/AuthContext";
import { ToastConfig } from "@/components/ToastConfig";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ToastConfig />
    </AuthProvider>
  );
}
