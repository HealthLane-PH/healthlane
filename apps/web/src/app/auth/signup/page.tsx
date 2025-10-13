"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@healthlane/auth";
import GoogleIcon from "@/app/components/GoogleIcon";
import { notify } from "@/components/ToastConfig";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


export default function SignupPage({ onClose }: { onClose?: () => void }) {
  const { signup, googleSignIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    emailRegex.test(email.trim()) && // ✅ must be valid format
    password.trim().length >= 6 &&
    role !== "";



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || !isFormValid) return;
    setLoading(true);



    // Trim values
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    // Field validations
    if (!trimmedFirst || !trimmedLast) {
      notify.warning("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      notify.warning("Please provide your email address.");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      notify.warning("Please enter a valid email address.");
      return;
    }

    if (!trimmedPass || trimmedPass.length < 6) {
      notify.warning("Password must be at least 6 characters.");
      return;
    }

    if (!role) {
      notify.warning("Please select your role before signing up.");
      return;
    }

    try {
      // Create account with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
      const user = userCredential.user;

      // Update Firebase display name (for quick identification)
      await updateProfile(user, {
        displayName: `${trimmedFirst} ${trimmedLast}`,
      });

      // Store extra details in Firestore under "users" collection
      await setDoc(doc(db, "users", user.uid), {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        role,
        createdAt: serverTimestamp(),
      });

      notify.success("Account created successfully!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("");

      setTimeout(() => {
        if (onClose) onClose();
      }, 500);


      // Redirect to the correct dashboard based on role
      router.push(`/dashboard/${role}`);

    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        notify.warning("This email is already registered. Try logging in instead.");
      } else if (error.code === "auth/invalid-email") {
        notify.warning("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        notify.warning("Password should be at least 6 characters.");
      } else {
        notify.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }


  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Capitalize first letter only
    setFirstName(value.charAt(0).toUpperCase() + value.slice(1));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value.charAt(0).toUpperCase() + value.slice(1));
  };

  const handleGoogle = async () => {
    try {
      await googleSignIn();
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    // <div className="min-h-screen flex items-start justify-center pt-20 sm:pt-28 w-[450px] mx-auto w-[90%] sm:w-[450px] min-w-[200px] max-w-[500px]">
    //<div className="flex items-center justify-center">

    <form
      onSubmit={handleSignup}
      //className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] w-full max-w-lg space-y-3 border border-gray-100 modal-context:bg-transparent modal-context:shadow-none modal-context:border-0 modal-context:p-0"
      className="bg-white rounded-2xl w-full sm:w-[430px] max-w-[95vw] p-10 space-y-3"
    >
      <h1 className="text-2xl font-semibold text-center text-gray-800">
        Create Your Account
      </h1>

      {/* First Name */}
      <div className="relative">
        <input
          type="text"
          id="firstName"
          className="peer border rounded-lg w-full px-3 pt-7 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1bae69]"
          placeholder=" "
          value={firstName}
          onChange={handleFirstNameChange}
          required
        />
        <label
          htmlFor="firstName"
          className="absolute text-gray-500 text-xs left-3 top-2.5 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm 
            peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 
            peer-focus:text-xs peer-focus:text-[#1bae69]"
        >
          First Name
        </label>
      </div>

      {/* Last Name */}
      <div className="relative">
        <input
          type="text"
          id="lastName"
          className="peer border rounded-lg w-full px-3 pt-7 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1bae69]"
          placeholder=" "
          value={lastName}
          onChange={handleLastNameChange}
          required
        />
        <label
          htmlFor="lastName"
          className="absolute text-gray-500 text-xs left-3 top-2.5 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm 
            peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 
            peer-focus:text-xs peer-focus:text-[#1bae69]"
        >
          Last Name
        </label>
      </div>

      {/* Email */}
      <div className="relative">
        <input
          type="text"
          id="email"
          placeholder=" "
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(""); // clears error once they start typing again
          }}
          className={`peer border rounded-lg w-full px-3 pt-7 pb-2 text-sm focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-400" : "focus:ring-[#1bae69]"
            }`}
        />

        {emailError && (
          <p className="text-red-500 text-xs mt-1">{emailError}</p>
        )}

        <label
          htmlFor="email"
          className="absolute text-gray-500 text-xs left-3 top-2.5 transition-all 
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm 
            peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 
            peer-focus:text-xs peer-focus:text-[#1bae69]"
        >
          Email
        </label>
      </div>

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="peer border rounded-lg w-full px-3 pt-7 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1bae69] pr-10"
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label
          htmlFor="password"
          className="absolute text-gray-500 text-xs left-3 top-2.5 transition-all 
    peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 
    peer-focus:text-xs peer-focus:text-[#1bae69]"
        >
          Password
        </label>

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
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


      {/* Role */}
      <div>
        <label
          htmlFor="role"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          Sign up as a
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#1bae69] focus:outline-none"
        >
          <option value="">Select your role</option>
          <option value="doctor">Doctor</option>
          <option value="laboratory">Laboratory</option>
          <option value="staff">Clinic Staff</option>
          <option value="patient">Patient</option>
        </select>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full flex items-center justify-center gap-2 ${loading || !isFormValid
            ? "bg-[#1bae69]/50 cursor-not-allowed"
            : "bg-[#1bae69] hover:bg-[#169a5f]"
            } text-white py-3 rounded-2xl font-semibold tracking-tight shadow-[0_4px_14px_rgba(27,174,105,0.25)] transition-all duration-300 active:scale-[0.98]`}
        >

          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>Creating account...</span>
            </>
          ) : (
            "Sign Up"
          )}
        </button>

      </div>

      <div className="flex items-center gap-2">
        <hr className="flex-grow border-gray-300" />
        <span className="text-xs text-gray-400">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full bg-gray-50 py-3 rounded-2xl border text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all duration-300"
      >
        <GoogleIcon size={18} />
        <span>Sign up with Google</span>
      </button>

    </form>
    //</div>
  );
}