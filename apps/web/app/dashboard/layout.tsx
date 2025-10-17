"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          console.warn("⚠️ No user doc found — redirecting to login.");
          router.replace("/auth/login");
          return;
        }

        const data = snap.data();
        const role = data.role;
        const isVerified = data.isVerified ?? false;

        if (role === "doctor") {
          if (isVerified) {
            router.replace("/dashboard/doctor");
          } else {
            router.replace("/dashboard/doctor/onboarding");
          }
        } else if (role === "patient") {
          router.replace("/dashboard/patient");
        } else {
          router.replace("/auth/login");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // === Loading Screen ===
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        {/* Subtle spinning loader */}
        <div className="relative mb-6">
          <div className="h-14 w-14 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Text and subtext */}
        <div className="bg-white px-10 py-6 rounded-xl shadow-md border border-gray-100 text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Checking your account
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we prepare your dashboard.
          </p>
        </div>

        {/* Soft background gradient shimmer */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-gray-50 to-gray-100" />
      </div>
    );
  }

  // Should never render since we redirect
  return <>{children}</>;
}