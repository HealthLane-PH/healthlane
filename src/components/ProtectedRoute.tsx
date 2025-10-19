"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import { User } from "firebase/auth";


export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user: User | null) => {
      if (!user) {
        // small delay avoids React tearing the old tree mid-transition
        setTimeout(() => router.replace("/auth/login"), 50);
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    // while Firebase still checking user
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}