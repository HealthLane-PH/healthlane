"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@healthlane/auth/useAuth";
import GoogleIcon from "@healthlane/ui/GoogleIcon";
import { notify } from "@/components/ToastConfig";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { auth, db } from "@/firebaseConfig";

// 🔗 Where Firebase should send users after clicking the verification link
const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`,
  handleCodeInApp: false,
};

interface SignupFormProps {
  role: string;
  title?: string;
  showRoleDropdown?: boolean;
  onClose?: () => void;
}

export default function SignupForm({
  role,
  title = "Create Your Account",
  showRoleDropdown = false,
  onClose,
}: SignupFormProps) {
  const { googleSignIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customRole, setCustomRole] = useState(role);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPatientData, setPendingPatientData] = useState<any>(null);


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    emailRegex.test(email.trim()) &&
    password.trim().length >= 6 &&
    (showRoleDropdown ? customRole : role);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !isFormValid) return;
    setLoading(true);

    try {
      console.log("🟢 Starting signup...");

      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPass = password.trim();

      const {
        fetchSignInMethodsForEmail,
        createUserWithEmailAndPassword,
        updateProfile,
        sendEmailVerification,
        signInWithEmailAndPassword,
      } = await import("firebase/auth");
      const {
        getDocs,
        query,
        where,
        collection,
        setDoc,
        doc,
        serverTimestamp,
      } = await import("firebase/firestore");

      console.log("🔍 Checking if email exists in Firebase Auth...");
      const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
      console.log("✅ Auth methods found:", methods);

      const emailExistsInAuth = methods.length > 0;

      // 3️⃣ Create or link account
      console.log("🔍 Checking if email exists in patients collection...");
      const patientQuery = query(collection(db, "patients"), where("email", "==", trimmedEmail));
      const patientSnap = await getDocs(patientQuery);
      const alreadyPatient = !patientSnap.empty;

      console.log("📦 Branching logic:", { emailExistsInAuth, alreadyPatient });

      if (alreadyPatient) {
        notify.warning("This email is already registered as a patient. Please log in instead.");
        router.push("/auth/login");
        return;
      }

      // Try to create a Firebase Auth user
      let userCredential;
      try {
        console.log("🆕 Trying to create new Auth user...");
        userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          console.log("⚠️ Detected existing Auth user.");
          setPendingPatientData({
            firstName: trimmedFirst,
            lastName: trimmedLast,
            email: trimmedEmail,
          });
          setShowConfirmModal(true); // 👈 triggers the confirmation modal
          return; // stop here, wait for user response
        }

      }

      // If userCredential is null, email exists in Auth (e.g. staff)
      if (!userCredential) {
        console.log("👥 Existing Auth user — creating patient record directly.");
        await setDoc(doc(collection(db, "patients")), {
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
          role: "patient",
          status: "Active",
          createdAt: serverTimestamp(),
        });
        notify.success("Welcome! Your patient account has been created.");
        await new Promise((r) => setTimeout(r, 500));
        router.push("/dashboard");
        return;
      }

      // If userCredential exists, it's a brand new user
      const user = userCredential.user;
      await updateProfile(user, { displayName: `${trimmedFirst} ${trimmedLast}` });
      await sendEmailVerification(user, actionCodeSettings);

      await setDoc(doc(collection(db, "patients")), {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        role: "patient",
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      notify.success("Account created! Please check your email to verify your account.");
      await new Promise((r) => setTimeout(r, 500));
      router.push("/auth/login?verified=false");

    } catch (error: any) {
      console.error("❌ Error caught in signup flow:", error);
      notify.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogle = async () => {
    try {
      setLoading(true);

      const user = await googleSignIn(role);
      if (!user) throw new Error("No user returned from Google Sign-In.");

      const { getDoc, doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/firebaseConfig");

      const collectionName = role === "doctor" ? "doctors" : "patients";
      const userRef = doc(db, collectionName, user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const baseData = {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          email: user.email,
          role,
          createdAt: serverTimestamp(),
        };

        if (role === "doctor") {
          await setDoc(userRef, {
            ...baseData,
            accountStatus: "Account Confirmed", // doctor auto-confirmed for email, onboarding still required
          });
        } else {
          await setDoc(userRef, {
            ...baseData,
            status: "Active", // Google = verified, skip pending state
          });
        }

        notify.success(`Welcome, ${role === "doctor" ? "Doctor" : "Patient"}!`);
      }

      router.push(role === "doctor" ? "/dashboard/onboarding" : "/dashboard");
    } catch (err: any) {
      console.error(err);
      notify.error("Google sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="bg-white rounded-2xl w-full sm:w-[430px] max-w-[95vw] p-10 space-y-3"
    >
      <h1 className="text-2xl font-semibold text-center text-gray-800">{title}</h1>

      {/* First Name */}
      <div className="relative">
        <input
          type="text"
          id="firstName"
          className="peer border rounded-lg w-full px-3 pt-7 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1bae69]"
          placeholder=" "
          value={firstName}
          onChange={(e) =>
            setFirstName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))
          }
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
          onChange={(e) =>
            setLastName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))
          }
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
          onChange={(e) => setEmail(e.target.value)}
          className="peer border rounded-lg w-full px-3 pt-7 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1bae69]"
        />
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

      {/* Role Dropdown (optional) */}
      {showRoleDropdown && (
        <div>
          <label
            htmlFor="role"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Sign up as a
          </label>
          <select
            id="role"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#1bae69] focus:outline-none"
          >
            <option value="">Select your role</option>
            <option value="doctor">Doctor</option>
            <option value="laboratory">Laboratory</option>
            <option value="staff">Clinic Staff</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      )}

      {/* Submit Button */}
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

      {/* Divider */}
      <div className="flex items-center gap-2">
        <hr className="flex-grow border-gray-300" />
        <span className="text-xs text-gray-400">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Google Signup */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full bg-gray-50 py-3 rounded-2xl border text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all duration-300"
      >
        <GoogleIcon size={18} />
        <span>Sign up with Google</span>
      </button>

      {role === "patient" && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Are you a doctor or partner?{" "}
          <a
            href="/auth/doctors/signup"
            className="text-[#1bae69] font-medium hover:underline"
          >
            Sign up here
          </a>
        </p>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            <p className="text-gray-700 mb-6 text-sm">
              This email already exists in our system.
              <br />
              By creating a patient account, your original password will still apply.
              <br />
              Continue?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  const { doc, collection, setDoc, serverTimestamp } = await import("firebase/firestore");
                  await setDoc(doc(collection(db, "patients")), {
                    ...pendingPatientData,
                    role: "patient",
                    status: "Active",
                    createdAt: serverTimestamp(),
                  });
                  notify.success("Your patient account has been created!");
                  router.push("/dashboard");
                }}
                className="px-4 py-2 bg-[#1bae69] text-white rounded-lg hover:bg-[#169a5f]"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}