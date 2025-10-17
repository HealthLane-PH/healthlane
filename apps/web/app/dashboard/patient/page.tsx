"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@healthlane/auth";

export default function Page() {
  const router = useRouter();
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.data() as { firstName?: string; email?: string } | undefined;
        setFirstName(data?.firstName || u.displayName?.split(" ")[0] || (data?.email ?? "").split("@")[0] || "there");
      } catch {
        setFirstName("there");
      }
    })();
  }, []);

  return (
    <div className="min-h-[60vh] max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-2">Welcome, {firstName} 👋</h1>
      <p className="text-gray-600 mb-8">
        This is your patient dashboard. (We’ll add widgets here later.)
      </p>

      <button
        onClick={async () => {
          await logout();
        }}
        className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
      >
        Log out
      </button>
    </div>
  );
}