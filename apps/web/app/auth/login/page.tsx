"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { notify } from "@/components/ToastConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import GoogleIcon from "@healthlane/ui/GoogleIcon";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@healthlane/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleSignIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Modes
  const [isResetMode, setIsResetMode] = useState(false);    // Forgot password
  const [isResendMode, setIsResendMode] = useState(false);  // Resend verification

  // Inline notice box
  const [success, setSuccess] = useState("");

  const showVerificationNotice = searchParams.get("verified") === "false";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1️⃣ Check if a patient record exists first
      const q = query(collection(db, "patients"), where("email", "==", normalizedEmail));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        notify.error("We couldn’t find a patient account with that email address.");
        setLoading(false);
        return;
      }

      // 2️⃣ Proceed to Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      // 3️⃣ Email not verified
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        notify.error(
          "Your account isn’t active yet. Please check your inbox for the verification link."
        );
        await signOut(auth);
        return;
      }

      // 4️⃣ If patient record exists, continue normal flow
      const patientDoc = querySnap.docs[0];
      const patientData = patientDoc.data();

      if (patientData.status === "Pending") {
        await updateDoc(doc(db, "patients", patientDoc.id), { status: "Active" });
      }

      if (patientData.status && ["Suspended", "Banned"].includes(patientData.status)) {
        notify.warning("Your account has been suspended or banned. Please contact support.");
        await signOut(auth);
        return;
      }

      notify.success("Login successful! Redirecting...");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      const code = error.code || "";
      if (code === "auth/user-not-found") {
        notify.error("We couldn’t find a patient account with that email address.");
      } else if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        notify.error("Incorrect password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        notify.error("Too many failed attempts. Please try again later.");
      } else if (code === "auth/network-request-failed") {
        notify.error("Network error. Please check your connection.");
      } else {
        notify.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Ensure the email belongs to a patient
      const q = query(collection(db, "patients"), where("email", "==", normalizedEmail));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        notify.error("We could not find any patient account with that email.");
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, normalizedEmail);
      setSuccess(
        "Password reset email sent! Please check your inbox. If you do not see it, check your spam folder or contact info@healthlane.ph for assistance."
      );
      setIsResetMode(false);
    } catch (error: any) {
      console.error("Password reset error:", error);
      notify.error("Failed to send reset email. Please check the email entered.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 🔍 Make sure the email exists in patients
      const q = query(collection(db, "patients"), where("email", "==", normalizedEmail));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        notify.error("We could not find any patient account with that email.");
        setLoading(false);
        return;
      }

      // ✅ Try temporary sign-in to check verification status
      const tempUserCred = await signInWithEmailAndPassword(auth, normalizedEmail, password || " ")
        .catch(() => null);

      if (tempUserCred?.user) {
        if (tempUserCred.user.emailVerified) {
          // ✅ Already verified
          setSuccess("Your email is already verified. You can log in directly.");
          await signOut(auth);
          setIsResendMode(false);
          setLoading(false);
          return;
        }

        // 🚀 Send new verification email
        await sendEmailVerification(tempUserCred.user);
        await new Promise((res) => setTimeout(res, 500)); // wait briefly before logout
        await signOut(auth);

        setSuccess(
          "Verification email resent! Please check your inbox. If you do not see it, check your spam folder or contact info@healthlane.ph for assistance."
        );
        setIsResendMode(false);
      } else {
        // Could not sign in temporarily
        setSuccess(
          "We found your account, but could not resend the email automatically. Please contact info@healthlane.ph for help."
        );
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
      notify.error("Could not resend verification email. Try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen flex-col gap-4">
      {showVerificationNotice && (
        <div className="text-green-600 bg-green-50 border border-green-200 text-sm rounded-lg p-3 text-center w-full max-w-md">
          Verification link sent to your email. Please verify your account before logging in.
        </div>
      )}

      <form
        onSubmit={
          isResetMode
            ? handleForgotPassword
            : isResendMode
              ? handleResendVerificationSubmit
              : handleLogin
        }
        className="bg-white shadow-md rounded-2xl px-8 pt-6 pb-8 w-full max-w-md"
      >
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">
          {isResetMode
            ? "Reset Your Password"
            : isResendMode
              ? "Resend Verification Email"
              : "Log In to Your Account"}
        </h2>

        {/* Inline success / info box */}
        {success && (
          <div className="mb-4 text-green-600 bg-green-50 border border-green-200 text-sm rounded-lg p-3 text-center">
            {success}
          </div>
        )}

        {/* Email field is always shown */}
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

        {/* Hide password in reset & resend modes */}
        {!isResetMode && !isResendMode && (
          <div className="mb-6">
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
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-semibold ${loading ? "bg-gray-400" : "bg-[#1bae69] hover:bg-[#169a5f]"
            } transition-colors`}
        >
          {loading
            ? isResetMode
              ? "Sending..."
              : isResendMode
                ? "Sending..."
                : "Logging in..."
            : isResetMode
              ? "Reset Password"
              : isResendMode
                ? "Resend Verification"
                : "Log In"}
        </button>

        {/* Toggle links */}
        <div className="mt-4 text-center space-x-4">
          {!isResetMode && !isResendMode && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setIsResendMode(false);
                  setSuccess("");
                }}
                className="text-[#1bae69] text-sm underline"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResendMode(true);
                  setIsResetMode(false);
                  setSuccess("");
                }}
                className="text-[#1bae69] text-sm underline"
              >
                Resend verification
              </button>
            </>
          )}

          {(isResetMode || isResendMode) && (
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setIsResendMode(false);
                setSuccess("");
              }}
              className="text-[#1bae69] text-sm underline"
            >
              Back to login
            </button>
          )}
        </div>

        {/* Google login only in main login mode */}
        {!isResetMode && !isResendMode && (
          <>
            <div className="my-4 flex items-center">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-400 text-xs mx-2">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  setGoogleLoading(true);

                  const user = await googleSignIn();
                  if (!user) throw new Error("No user returned from Google Sign-In.");

                  // Ensure a patient record exists
                  const userRef = doc(db, "patients", user.uid);
                  const userSnap = await getDoc(userRef);

                  if (!userSnap.exists()) {
                    await setDoc(userRef, {
                      firstName: user.displayName?.split(" ")[0] || "",
                      lastName: user.displayName?.split(" ")[1] || "",
                      email: user.email,
                      role: "patient",
                      status: "Active", // Google accounts are considered verified
                      createdAt: serverTimestamp(),
                    });
                    notify.success(`Welcome, ${user.displayName?.split(" ")[0] || "Patient"}!`);
                  } else {
                    notify.success("Welcome back!");
                  }

                  router.push("/dashboard");
                } catch (err) {
                  console.error(err);
                  notify.error("Google sign-in failed. Please try again.");
                } finally {
                  setGoogleLoading(false);
                }
              }}
              className="w-full border border-gray-300 rounded-md py-2 flex items-center justify-center space-x-2 hover:bg-gray-50"
            >
              <GoogleIcon size={18} />
              <span>{googleLoading ? "Signing in..." : "Sign in with Google"}</span>
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
          </>
        )}
      </form>
    </div>
  );
}