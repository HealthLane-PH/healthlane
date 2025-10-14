import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";


export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  async function ensureUserDocIfMissing(
    uid: string,
    data: { firstName?: string; lastName?: string; email?: string; role?: string; isVerified?: boolean }
  ) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: (data.email || "").toLowerCase(),
        role: data.role || "patient",
        isVerified: data.isVerified ?? true,
        profileStatus: (data.role || "patient") === "doctor" ? "pending" : "active",
        createdAt: serverTimestamp(),
      });
    }
  }

  const signup = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const googleSignIn = async (role?: string) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const u = result.user;

    // Split displayName into first/last best-effort
    const fullName = u.displayName || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    // Ensure Firestore doc exists for first-time Google users
    await ensureUserDocIfMissing(u.uid, {
      firstName,
      lastName,
      email: u.email || "",
      role,                 // if undefined (e.g., login page), helper defaults to "patient"
      isVerified: true,     // we treat Google sign-ins as verified
    });

    return u;
  };

  const logout = () => signOut(auth);

  return { user, signup, login, googleSignIn, logout };
}