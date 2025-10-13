"use client";
import { useAuth } from "@healthlane/auth";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Welcome, {user?.displayName || "Doctor"}!</h1>
        <div className="text-left space-y-2">
          <p>🟢 Create an account</p>
          <p>⚪ Submit your details</p>
          <p>⚪ Wait for verification</p>
          <p>⚪ Verified</p>
        </div>
      </div>
    </div>
  );
}
