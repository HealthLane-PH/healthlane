export const metadata = {
  title: "Terms of Service — HealthLane PH",
  description:
    "The terms that govern the use of HealthLane by doctors, clinics, and patients.",
};

export default function TermsPage() {
  return (
    <main className="prose prose-zinc max-w-3xl mx-auto px-6 py-12 prose-headings:font-semibold prose-headings:mt-8">

      <h1>Terms of Service</h1>
      <p><strong>Effective Date:</strong> October 2025</p>

      <p>
        Welcome to HealthLane. By creating an account or using our platform, you agree to these
        Terms of Service.
      </p>

      <h2>1. Purpose of the Service</h2>
      <p>
        HealthLane provides digital tools for licensed healthcare providers to manage clinics,
        queues, and records, and for patients to connect with verified providers, store basic health
        data, and access consultation notes.
      </p>

      <h2>2. User Accounts</h2>
      <ul>
        <li>You must be at least 18 years old to register.</li>
        <li>Doctors must provide a valid PRC ID and agree to verification.</li>
        <li>You are responsible for keeping your login credentials secure and for all activity under your account.</li>
      </ul>

      <h2>3. Acceptable Use</h2>
      <ul>
        <li>Do not misrepresent your identity or professional status.</li>
        <li>Do not access another user’s data without explicit consent.</li>
        <li>Do not upload malicious code, spam, or harmful content.</li>
        <li>Do not use HealthLane for unlawful or misleading purposes.</li>
      </ul>
      <p>Violation of these rules may lead to account suspension or deletion.</p>

      <h2>4. Data Ownership and Consent</h2>
      <ul>
        <li>Patients retain ownership of their medical records.</li>
        <li>Doctors retain authorship of consultation notes they create.</li>
        <li>HealthLane acts only as a secure digital intermediary.</li>
      </ul>

      <h2>5. Platform Availability</h2>
      <p>
        We strive for continuous access but cannot guarantee uninterrupted service. Maintenance or
        technical issues may cause temporary downtime.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        HealthLane is provided “as is.” We are not liable for indirect or consequential damages
        arising from use of the platform. This does not limit rights you have under applicable law.
      </p>

      <h2>7. Updates to These Terms</h2>
      <p>
        We may revise these Terms when we add new features. Continued use of HealthLane after an
        update means you accept the revised Terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        For inquiries about these Terms, please email <a href="mailto:info@healthlane.ph">info@healthlane.ph</a>.
      </p>
    </main>
  );
}