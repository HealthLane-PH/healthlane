export const metadata = {
  title: "Privacy Policy — HealthLane PH",
  description:
    "How HealthLane collects, uses, and protects your information in compliance with the Philippine Data Privacy Act.",
};

export default function PrivacyPage() {
  return (
    <main className="prose prose-zinc max-w-3xl mx-auto px-6 py-12 prose-headings:font-semibold prose-headings:mt-8">

      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> October 2025</p>

      <p>
        HealthLane (“we,” “our,” or “us”) provides digital tools that help licensed healthcare
        providers manage their clinics and help patients connect with verified doctors. We respect
        your privacy and comply with the <em>Philippine Data Privacy Act of 2012 (Republic Act 10173)</em>.
        This Privacy Policy explains what information we collect, how we use it, and how you can
        control it.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>For healthcare providers</h3>
      <ul>
        <li>Full name, professional title or suffix</li>
        <li>PRC ID number (for verification)</li>
        <li>Email address and optional contact number</li>
        <li>Clinic name(s) and address(es)</li>
        <li>Secretary or staff names and email addresses</li>
      </ul>

      <h3>For patients</h3>
      <ul>
        <li>Full name, date of birth, and gender</li>
        <li>Basic health information recorded during consultations (e.g., weight, blood pressure, notes, medications)</li>
        <li>Files you choose to upload (e.g., lab results or imaging reports)</li>
      </ul>

      <h3>For all users</h3>
      <ul>
        <li>Login credentials (email + password, or Google / Apple sign-in)</li>
        <li>Device and usage data automatically provided by your browser or app (for security, analytics, and error logs)</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Create and maintain your HealthLane account</li>
        <li>Verify professional credentials of doctors</li>
        <li>Facilitate queueing, scheduling, and patient record management</li>
        <li>Improve platform features and security</li>
        <li>Communicate important updates or policy changes</li>
      </ul>
      <p><strong>We do not sell or rent</strong> personal data to third parties.</p>

      <h2>3. Consent and Control</h2>
      <ul>
        <li>Patients can choose which doctors may view their consultation notes or uploaded files.</li>
        <li>You may withdraw consent or request deletion of your account at any time by emailing <a href="mailto:privacy@healthlane.ph">privacy@healthlane.ph</a>.</li>
        <li>Doctors may request correction or removal of outdated professional information.</li>
      </ul>

      <h2>4. Data Storage and Security</h2>
      <p>
        Data is stored on Google Firebase (Firestore &amp; Storage) in secure, encrypted form.
        Access is restricted to authorized accounts through verified authentication. Regular
        backups and security reviews help protect your information.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain data only as long as necessary for your use of the service or as required by law.
        When you delete your account, personal information is permanently removed from our active
        systems within 30 days.
      </p>

      <h2>6. Sharing of Information</h2>
      <ul>
        <li>With other healthcare providers you explicitly authorize</li>
        <li>With service providers that host or support our system (Firebase / Google Cloud) under data-processing agreements</li>
        <li>When required by law, regulation, or court order</li>
      </ul>

      <h2>7. Children’s Privacy</h2>
      <p>
        HealthLane is intended for use by adults and licensed practitioners. Patients under 18
        should use the platform only with parent or guardian supervision.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Policy as our features expand. When we do, we’ll post the new date above
        and notify users through email or in-app notice.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For questions or data-related requests, contact:<br />
        <strong>Email:</strong> <a href="mailto:privacy@healthlane.ph">privacy@healthlane.ph</a><br />
        <strong>General inquiries:</strong> <a href="mailto:info@healthlane.ph">info@healthlane.ph</a><br />
        <strong>Address:</strong> HealthLane PH, Naga City, Philippines
      </p>
    </main>
  );
}