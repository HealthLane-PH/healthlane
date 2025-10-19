"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { notify } from "@/components/ToastConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import GoogleIcon from "@healthlane/ui/GoogleIcon";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@healthlane/auth/useAuth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  setDoc,
} from "firebase/firestore";

// 🟢 Confirm we’re connected to Firebase
console.log("Auth app name:", auth.app.name);
console.log("Firestore app name:", db.app.name);

export default function LoginPage() {
  const router = useRouter();
  const { googleSignIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 🧩 Always bind Firestore to the same Firebase App instance as Auth
  const fdb = getFirestore(auth.app);
  console.log("✅ Bound Firestore to app:", fdb.app.name);

  // 🔎 TEMP DEBUG — confirm which Firestore build we’re actually using
  console.log("🔥 db type check:", typeof db, db.constructor?.name);
  console.log("🔥 fdb type check:", typeof fdb, fdb.constructor?.name);

  // 🔹 Email + Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    console.log("🟩 Attempting login for:", normalizedEmail);

    try {
      // 1️⃣ Try Firebase Auth login
      console.log("🔌 Step 1: Signing in with email/password...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const user = userCredential.user;
      console.log("✅ Auth success:", user.uid, user.email);

      // 2️⃣ Refresh email verification state
      await user.reload();
      console.log("📩 Email verified =", user.emailVerified);

      if (!user.emailVerified) {
        console.log("⛔ Not verified. Sending verification email...");
        await sendEmailVerification(user);
        notify.warning(
          "Verification email sent. Please verify before logging in."
        );
        await signOut(auth);
        setLoading(false);
        return;
      }

      // 3️⃣ Check doctor record in Firestore
      console.log("🗄️ Step 3: Querying 'doctors' collection for email...");
      console.log("🧠 About to call collection():", fdb);
      console.log("🧠 fdb.constructor.name =", fdb.constructor?.name);
      console.log("🧠 typeof fdb =", typeof fdb);
      console.log("🧠 Firestore app name =", fdb.app?.name);

      let collectionRef;
      try {
        collectionRef = collection(fdb, "doctors");
        console.log("✅ collection() succeeded:", collectionRef);
      } catch (err) {
        console.error("❌ collection() failed:", err);
        throw err; // ⬅️ stop execution here to avoid passing undefined
      }

      if (!collectionRef) {
        console.error("⚠️ collectionRef is undefined — aborting Firestore query");
        return;
      }

      const q = query(
        collectionRef,
        where("email", "==", normalizedEmail),
        limit(1)
      );

      console.log("📡 Firestore query object:", q);

      const snapshot = await getDocs(q);
      console.log("📊 Query result size:", snapshot.size);

      if (snapshot.empty) {
        console.log("❌ No doctor document found for:", normalizedEmail);
        notify.error("No doctor account found. Please sign up first.");
        await signOut(auth);
        setLoading(false);
        return;
      }

      const doctorData = snapshot.docs[0].data();
      console.log("🧩 Doctor doc fields:", Object.keys(doctorData));
      console.log("👤 Doctor name:", doctorData.displayName || "(none)");

      // 4️⃣ Success — redirect
      console.log("🎯 Login successful, redirecting...");
      notify.success("Welcome back, Doctor!");
      router.push("/dashboard/onboarding");
    } catch (error: any) {
      console.error("🔥 Login error details:", error);
      if (error.code === "auth/user-not-found")
        notify.error("No account found for this email.");
      else if (error.code === "auth/wrong-password")
        notify.error("Incorrect password.");
      else notify.error(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google Login (auto-confirmed)
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      console.log("🔌 Attempting Google Sign-In...");
      const user = await googleSignIn(); // from your useAuth hook

      const email = user.email?.toLowerCase();
      if (!email) throw new Error("No email returned from Google.");
      console.log("✅ Google auth success:", user.uid, email);

      // Check if doctor record exists
      console.log("🗄️ Checking 'doctors' collection for Google user...");
      const q = query(collection(fdb, "doctors"), where("email", "==", email), limit(1));
      const snapshot = await getDocs(q);
      console.log("📊 Query size:", snapshot.size);

      // Auto-create a record if this is their first time
      if (snapshot.empty) {
        console.log("🆕 No existing doc found — creating new record...");
        await setDoc(doc(fdb, "doctors", user.uid), {
          email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: new Date(),
          verified: true,
          accountType: "doctor",
        });
        console.log("✅ New Google doctor record created.");
      }

      notify.success("Welcome, Doctor!");
      router.push("/dashboard/onboarding");
    } catch (err: any) {
      console.error("🔥 Google sign-in failed:", err);
      notify.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // 🔹 Resend verification
  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        notify.success("Verification email resent!");
      } else {
        notify.warning("Please log in first to resend verification.");
      }
    } catch (error: any) {
      notify.error("Could not resend verification email. Try again later.");
    }
  };

  // 🧭 UI
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-2xl px-8 pt-6 pb-8 w-full max-w-md"
      >
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">
          Log In to Your Doctor Account
        </h2>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1bae69]"
          />
        </div>

        {/* Password */}
        <div className="mb-6 relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1bae69] pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-semibold ${loading
            ? "bg-gray-400"
            : "bg-[#1bae69] hover:bg-[#169a5f]"
            } transition-colors`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="text-gray-400 text-xs mx-2">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full border border-gray-300 rounded-md py-2 flex items-center justify-center space-x-2 hover:bg-gray-50"
        >
          <GoogleIcon size={18} />
          <span>{googleLoading ? "Signing in..." : "Sign in with Google"}</span>
        </button>

        {/* Links */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Don’t have an account?{" "}
          <a
            href="/auth/doctors/signup"
            className="text-[#1bae69] font-medium hover:underline"
          >
            Sign up here
          </a>
        </p>

        <p className="text-center text-xs text-gray-500 mt-2">
          Didn’t receive the verification email?{" "}
          <button
            type="button"
            onClick={handleResendVerification}
            className="text-[#1bae69] font-medium hover:underline"
          >
            Resend verification
          </button>
        </p>
      </form>
    </div>
  );
}