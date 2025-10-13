"use client";

import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
}

export default function Page() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData: UserData[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() } as UserData);
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Firestore error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Users in the system</h1>
      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="space-y-4">
        
        </div>
      )}
    </main>
  );
}
