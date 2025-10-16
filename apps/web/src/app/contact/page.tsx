export const metadata = {
  title: "Contact — HealthLane PH",
  description:
    "Get in touch with the HealthLane team for inquiries, feedback, or partnership opportunities.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <h1 className="text-3xl font-semibold text-[#1761a4] mb-4">
        Contact Us
      </h1>
      <p className="max-w-xl text-gray-600">
        We’d love to hear from you. Whether you’re a doctor, patient, or
        potential partner, we’re here to help.
      </p>

      <div className="mt-8 text-gray-700">
        <p>
          📧 Email us at{" "}
          <a
            href="mailto:info@healthlane.ph"
            className="text-[#1761a4] font-medium hover:underline"
          >
            info@healthlane.ph
          </a>
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-8">A full contact form is coming soon.</p>
    </main>
  );
}