"use client";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
      <div className="max-w-md px-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-3">
          Welcome to HealthLane Doctor Portal
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your queue, view patient information, and stay connected—all in one place.
        </p>
        <a
          href="/auth/login"
          className="bg-primary text-white px-6 py-3 rounded-md shadow-md hover:bg-primaryDark transition"
        >
          Log In
        </a>
      </div>
    </main>
  );
}