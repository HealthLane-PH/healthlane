"use client";
import { ClipboardList, Users, User, Settings, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/doctor/queue", label: "Queue", icon: ClipboardList },
    { href: "/dashboard/doctor/patients", label: "Patients", icon: Users },
    { href: "/dashboard/doctor/profile", label: "Profile", icon: User },
    { href: "/dashboard/doctor/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/doctor/notifications", label: "Alerts", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 shadow-sm md:hidden z-50">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center text-[11px] ${
              active ? "text-primary" : "text-gray-500"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}