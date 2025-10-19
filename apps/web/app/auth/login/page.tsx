"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import { notify } from "@/components/ToastConfig";
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import GoogleIcon from "@healthlane/ui/GoogleIcon";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@healthlane/auth";


export default function LoginPage() {
  const router = useRouter();
  const { googleSignIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        notify.success("Verification email sent. Please check your inbox.");
        await signOut(auth);
        setLoading(false);
        return;
      }

      notify.success("Login successful! Redirecting...");
      router.push("/dashboard");
    } catch (error: any) {
      const message =
        error.code === "auth/user-not-found"
          ? "No account found for this email."
          : error.code === "auth/wrong-password"
            ? "Incorrect password."
            : "Login failed. Please try again.";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

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


  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-2xl px-8 pt-6 pb-8 w-full max-w-md"
      >
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">
          Log In to Your Account
        </h2>

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

        <div className="mb-6">
          {/* Password */}
          <div className="relative mb-6">
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
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-semibold ${loading ? "bg-gray-400" : "bg-[#1bae69] hover:bg-[#169a5f]"
            } transition-colors`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="text-gray-400 text-xs mx-2">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* 🔹 Google Login Button (placeholder for now) */}
        <button
          type="button"
          onClick={async () => {
            try {
              setGoogleLoading(true);
              await googleSignIn();           // no role on login: first-time users default to "patient"
              notify.success("You are now signed in.");
              router.push("/dashboard");      // guard will send to the right subpage
            } catch (err) {
              notify.error("Google sign-in failed. Please try again.");
            } finally {
              setGoogleLoading(false);
            }
          }}
          className="w-full border border-gray-300 rounded-md py-2 flex items-center justify-center space-x-2 hover:bg-gray-50"
        >
          <GoogleIcon size={18} />
          <span>Sign in with Google</span>
        </button>


        <p className="text-center text-xs text-gray-500 mt-4">
          Don’t have an account?{" "}
          <a
            href="/auth/patients/signup"
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