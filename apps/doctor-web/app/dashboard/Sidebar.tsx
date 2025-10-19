"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { notify } from "@/components/ToastConfig";
import {
    ClipboardList,
    Users,
    Home,
    Bell,
    Settings,
    LogOut,
} from "lucide-react";

export default function Sidebar({ onClose }: { onClose: () => void }) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            console.log("Attempting to sign out...");
            console.log("Current user before sign-out:", auth.currentUser?.email);

            await signOut(auth);

            // Check if logout worked
            console.log("Sign-out complete. Current user after sign-out:", auth.currentUser);

            notify.success("You’ve been logged out.");

            setTimeout(() => {
                console.log("Redirecting to login page...");
                router.replace("/auth/login");
            }, 300);
        } catch (error) {
            console.error("Logout error:", error);
            notify.error("Couldn’t log out. Please try again.");
        }
    };


    const links = [
        { name: "Queue", icon: ClipboardList, href: "/dashboard/queue" },
        { name: "Patients", icon: Users, href: "/dashboard/patients" },
        { name: "Profile", icon: Home, href: "/dashboard/profile" },
        { name: "Settings", icon: Settings, href: "/dashboard/settings" },
        { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
    ];

    return (
        <div className="flex flex-col h-full bg-white p-4 border-r border-gray-100">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/dashboard/onboarding">
                    <Image
                        src="/images/healthlane-logo-colored.png"
                        alt="HealthLane Logo"
                        width={150}
                        height={40}
                        priority
                        className="mx-auto"
                    />
                </Link>
                <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800">
                    ✕
                </button>
            </div>

            {/* ===== NAVIGATION ===== */}
            <nav className="flex-1 space-y-2">
                {links.map(({ name, icon: Icon, href }) => (
                    <Link
                        key={name}
                        href={href}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                        onClick={onClose}
                    >
                        <Icon size={20} />
                        <span>{name}</span>
                    </Link>
                ))}
            </nav>

            {/* ===== LOGOUT ===== */}
            <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition rounded-md"
            >
                <LogOut size={20} />
                <span>Log out</span>
            </button>
        </div>
    );
}