"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [success, setSuccess] = useState("");


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 Step 1. Firebase login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // 🔍 Step 2. Check staff record
      const q = query(collection(db, "staff"), where("email", "==", email));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        setError("This user does not exist.");
        setLoading(false);
        return;
      }

      const userData = querySnap.docs[0].data();

      // 🚧 Step 3. Verify status
      if (userData.status !== "Active") {
        setError("Your account isn’t active yet. Please check your inbox for the invite link.");
        setLoading(false);
        return;
      }

      // 🎯 Step 4. Role routing
      if (["Owner", "Admin", "Staff"].includes(userData.role)) {
        router.push("/staff/dashboard");
      } else {
        setError("Access denied. This account is not a staff user.");
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Login Error:", err);

      const message = err?.message?.toLowerCase() || "";
      const code = err?.code || "";

      if (code === "auth/invalid-credential" || code === "auth/user-not-found") {
        try {
          const q = query(collection(db, "staff"), where("email", "==", email));
          const querySnap = await getDocs(q);
          if (querySnap.empty) setError("This user does not exist.");
          else setError("Incorrect password. Please try again.");
        } catch {
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email first.");
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Please check your inbox.");
      setIsResetMode(false);
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Please check the email entered.");
    } finally {
      setLoading(false);
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
          {isResetMode ? "Reset Your Password" : "Staff Login Portal"}
        </h1>

        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-green-600 dark:text-green-400 text-sm text-center">
            {success}
          </div>
        )}


        <form
          onSubmit={isResetMode ? handleForgotPassword : handleLogin}
          className="space-y-4"
        >
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

          {!isResetMode && (
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
          )}

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
                {isResetMode ? "Sending…" : "Logging in…"}
              </>
            ) : isResetMode ? (
              "Reset Password"
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          {isResetMode ? (
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setError("");
              }}
              className="text-green-700 dark:text-green-400 text-sm underline"
            >
              Back to login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsResetMode(true);
                setError("");
              }}
              className="text-green-700 dark:text-green-400 text-sm underline"
            >
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}