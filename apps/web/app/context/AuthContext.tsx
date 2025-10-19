"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
});

// ✅ Add runtime guard so useAuth never runs on server accidentally
export const useAuth = () => {
  if (typeof window === "undefined") {
    // Prevents "reading useContext of null" during SSR
    console.warn("useAuth() was called on the server — returning defaults.");
    return { user: null, role: null, loading: false, logout: async () => {} };
  }
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Wrap in browser check for extra safety
    if (typeof window === "undefined") return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRole(docSnap.data().role);
          } else {
            setRole(null);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
