"use client";

import { ToastConfig } from "@/components/ToastConfig";

export default function RootWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastConfig />
    </>
  );
}