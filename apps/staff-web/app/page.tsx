"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 Step 1. Attempt Firebase Auth login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // 🔍 Step 2. Check Firestore staff record
      const q = query(collection(db, "staff"), where("email", "==", email));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        setError("This user does not exist.");
        setLoading(false);
        return;
      }

      const userData = querySnap.docs[0].data();

      // 🚧 Step 3. Check verification
      if (!userData.isVerified) {
        setError("Verify your email first. Please check your inbox for the invite link.");
        setLoading(false);
        return;
      }

      // 🎯 Step 4. Role-based routing
      if (["Owner", "Admin", "Staff"].includes(userData.role)) {
        router.push("/staff/dashboard");
      } else {
        setError("Access denied. This account is not a staff user.");
      }
    } catch (err: any) {
      // ✅ Prevent Next.js overlay crash
      setLoading(false);

      console.error("Login Error:", err);

      const message = err?.message?.toLowerCase() || "";
      const code = err?.code || "";

      // ✅ Instead of awaiting inside catch, handle Firestore check safely here
      if (code === "auth/invalid-credential" || code === "auth/user-not-found") {
        try {
          const q = query(collection(db, "staff"), where("email", "==", email));
          const querySnap = await getDocs(q);

          if (querySnap.empty) {
            setError("This user does not exist.");
          } else {
            setError("Incorrect password. Please try again.");
          }
        } catch (subErr) {
          console.error("Sub-check error:", subErr);
          setError("This user does not exist.");
        }
      } else if (code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (message.includes("network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };



  const handleForgotPassword = async () => {
    if (!email) return setError("Please enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Please check the email entered.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/healthlane-logo-colored.png"
            alt="HealthLane logo"
            width={180}
            height={70}
            priority
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
          Staff Login Portal
        </h1>

        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm 
                         bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                         text-gray-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm 
                         bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                         text-gray-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm sm:text-base font-medium transition ${loading
              ? "bg-[#1bae69]/70 cursor-not-allowed"
              : "bg-[#1bae69] hover:bg-[#169a5f]"
              } text-white`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Logging in…
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-green-700 dark:text-green-400 text-sm underline"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}