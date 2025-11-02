"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ToastConfig, notify } from "@/components/ToastConfig";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Auth guard logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        notify.warning("Please log in to access your dashboard.");
        router.push("/auth/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className={`${montserrat.variable} font-sans min-h-screen bg-[#F5F5F5]`}>
      <div className="flex bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] w-full h-screen">
        {/* ===== SIDEBAR (Desktop only) ===== */}
        <aside
          className={`fixed md:relative top-0 left-0 h-full w-64 border-r border-gray-100 flex flex-col justify-between z-40 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <Sidebar onClose={() => setIsOpen(false)} />
        </aside>

        {/* ===== OVERLAY (Mobile) ===== */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          />
        )}

        {/* ===== MAIN SECTION ===== */}
        <div className="flex-1 flex flex-col overflow-y-auto h-screen">
          {/* ===== MOBILE HEADER ===== */}
          <header className="md:hidden flex justify-between items-center py-4 px-5 bg-white shadow-sm border-b border-gray-100">
            {/* Logo left */}
            <Image
              src="/images/healthlane-logo-horizontal.png"
              alt="HealthLane Logo"
              width={150}
              height={42}
              className="drop-shadow-sm"
              priority
            />

            {/* “Download the app” button */}
            <a
              href="#"
              className="text-sm border border-gray-300 rounded-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Download the app
            </a>
          </header>

          {/* ===== MAIN CONTENT ===== */}
          <main className="flex-1 w-full bg-[#F5F5F5] overflow-y-auto px-4 sm:px-6 py-6 md:px-8">
            {children}
          </main>

          {/* ===== MOBILE NAVIGATION ===== */}
          <MobileNav />

          {/* ===== TOASTS ===== */}
          <ToastConfig />
        </div>
      </div>
    </div>
  );
}