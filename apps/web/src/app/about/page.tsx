export const metadata = {
  title: "About — HealthLane PH",
  description:
    "Learn more about HealthLane’s mission to make healthcare access seamless for clinics, doctors, and patients.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <h1 className="text-3xl font-semibold text-[#1761a4] mb-4">
        About HealthLane
      </h1>
      <p className="max-w-xl text-gray-600">
        HealthLane is building a simpler way for clinics, doctors, and patients
        in the Philippines to connect and manage care. Our mission is to make
        healthcare access more efficient, transparent, and human — one clinic at
        a time.
      </p>
      <p className="text-sm text-gray-500 mt-8">More details coming soon.</p>
    </main>
  );
}