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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center py-3 md:hidden z-50 shadow-[0_-1px_4px_rgba(0,0,0,0.06)] h-[68px] pb-[env(safe-area-inset-bottom)]">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center text-[12px] transition-colors ${
              active ? "text-primary" : "text-gray-500"
            }`}
          >
            <Icon
              size={23} // ⬅️ increased from 20 → 26 for better tap target
              strokeWidth={active ? 2 : 1.5}
              className="mb-0.5"
            />
            <span className="text-[12px] leading-tight">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}