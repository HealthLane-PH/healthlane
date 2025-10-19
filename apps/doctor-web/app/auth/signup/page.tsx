import SignupForm from "@healthlane/ui/SignupForm";

export default function DoctorSignupPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignupForm
        role="doctor"
        title="Create Your Doctor Account"
        showRoleDropdown={false}
      />
    </div>
  );
}