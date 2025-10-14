"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { notify } from "@/components/ToastConfig";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/auth/login");
          return;
        }

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          notify.error("User record not found.");
          router.replace("/auth/login");
          return;
        }

        const data = snap.data() as {
          role?: "doctor" | "patient" | string;
          isVerified?: boolean;
          profileStatus?: "pending" | "active" | string;
        };

        // If email is verified at Firebase level, sync Firestore flag once
        if (user.emailVerified && data.isVerified !== true) {
          await updateDoc(ref, { isVerified: true });
          data.isVerified = true;
        }

        const role = data.role === "doctor" ? "doctor" : "patient";
        const needsOnboarding = data.profileStatus !== "active";
        const target = needsOnboarding
          ? `/dashboard/${role}/onboarding`
          : `/dashboard/${role}`;

        if (!pathname.startsWith(target)) {
          router.replace(target);
        }
      } catch {
        notify.error("Failed to load your dashboard.");
        router.replace("/auth/login");
      } finally {
        setBooting(false);
      }
    });

    return () => unsub();
  }, [router, pathname]);

  if (booting) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return <>{children}</>;
}