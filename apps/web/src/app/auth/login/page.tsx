"use client";
import { useState } from "react";
import { useAuth } from "@healthlane/auth";

export default function SignupPage() {
  const { signup, googleSignIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(email, password);
    alert("Account created!");
  };

  const handleGoogle = async () => {
    await googleSignIn();
    alert("Signed in with Google!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Doctor Sign Up
        </h1>
        <input
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          placeholder="First name"
          className="border w-full p-2 rounded-md"
        />
        <input
          value={last}
          onChange={(e) => setLast(e.target.value)}
          placeholder="Last name"
          className="border w-full p-2 rounded-md"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="border w-full p-2 rounded-md"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="border w-full p-2 rounded-md"
        />

        <button
          type="submit"
          className="bg-[#1bae69] text-white w-full py-2 rounded-md hover:bg-[#169a5f]"
        >
          Create Account
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full border py-2 rounded-md hover:bg-gray-100"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
