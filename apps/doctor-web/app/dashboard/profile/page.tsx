"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";

export default function DoctorProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      {/* Profile content here */}

      {/* Show only on mobile */}
      <button
        onClick={handleLogout}
        className="mt-8 bg-red-100 text-red-600 px-6 py-2 rounded-md hover:bg-red-200 transition md:hidden"
      >
        Log out
      </button>
    </div>
  );
}