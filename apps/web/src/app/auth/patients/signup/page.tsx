import SignupForm from "@/app/components/SignupForm";

export default function PatientSignupPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignupForm
        role="patient"
        title="Create Your Patient Account"
        showRoleDropdown={false}
      />
    </div>
  );
}
