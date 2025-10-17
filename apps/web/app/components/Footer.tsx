import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-[#1761a4] text-gray-100 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {/* Column 1 — Branding */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-2">HealthLane PH</h3>
          <p className="text-sm text-gray-200 max-w-xs">
            Streamlining healthcare for clinics, doctors, and patients in the Philippines.
          </p>
        </div>

        {/* Column 2 — Navigation */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/auth/patients/signup" className="hover:underline">
                Sign Up
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:underline">
                Log In
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 — Legal */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </li>
          </ul>
          <p className="text-[12px] text-gray-300 mt-6">
            © {new Date().getFullYear()} HealthLane PH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;