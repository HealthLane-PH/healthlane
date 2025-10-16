"use client";

import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import { db } from "../firebaseConfig";
// import { collection, getDocs } from "firebase/firestore";

export default function Page() {
  // const [users, setUsers] = useState<UserData[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function fetchUsers() {
  //     try {
  //       const querySnapshot = await getDocs(collection(db, "users"));
  //       const usersData: UserData[] = [];
  //       querySnapshot.forEach((doc) => {
  //         usersData.push({ id: doc.id, ...doc.data() } as UserData);
  //       });
  //       setUsers(usersData);
  //     } catch (error) {
  //       console.error("Firestore error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchUsers();
  // }, []);

  return (
    <main className="min-h-screen bg-grayBg flex flex-col items-center text-center pt-32 pb-20 px-6">
      {/* Hero Section */}
      <section className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Streamlining healthcare, one clinic at a time.
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          HealthLane helps doctors manage their clinics efficiently and lets patients
          connect with verified providers — all in one secure platform.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-[#1bae69] text-white rounded-full font-medium hover:bg-[#169a5f] transition"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-[#1761a4] text-[#1761a4] rounded-full font-medium hover:bg-[#1761a4] hover:text-white transition"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-24 grid gap-10 md:grid-cols-3 max-w-5xl">
        <div className="bg-white rounded-2xl shadow p-8">
          <h3 className="text-lg font-semibold text-[#1761a4] mb-3">For Doctors</h3>
          <p className="text-gray-600">
            Manage clinics, staff, and patients with ease — from queue tracking to consultation notes.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h3 className="text-lg font-semibold text-[#1761a4] mb-3">For Patients</h3>
          <p className="text-gray-600">
            Find verified healthcare providers and securely access your consultation history anytime.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h3 className="text-lg font-semibold text-[#1761a4] mb-3">For Clinics</h3>
          <p className="text-gray-600">
            Simplify operations, reduce waiting times, and offer a better care experience to patients.
          </p>
        </div>
      </section>

      {/* Temporary note */}
      <p className="text-sm text-gray-400 mt-20">
        This is a preview version of HealthLane PH — new features coming soon.
      </p>
    </main>
  );
}