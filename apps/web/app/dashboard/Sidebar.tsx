"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut, User } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
    HomeIcon,
    UsersIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    BellIcon
} from "@heroicons/react/24/outline";

interface FirestoreUser {
    preferredName?: string;
    firstName?: string;
    email?: string;
    photoURL?: string;
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<FirestoreUser | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (u) => {
            if (u) {
                setUser(u);
                // Try fetching by UID first
                const userRef = doc(db, "users", u.uid);
                const snap = await getDoc(userRef);

                if (snap.exists()) {
                    setUserData(snap.data() as FirestoreUser);
                } else {
                    // fallback: fetch by email
                    const q = query(collection(db, "users"), where("email", "==", u.email));
                    const querySnap = await getDocs(q);
                    if (!querySnap.empty) {
                        setUserData(querySnap.docs[0].data() as FirestoreUser);
                    }
                }
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const menuItems = [
        { name: "Home", path: "/dashboard/patient", icon: <HomeIcon className="h-5 w-5" /> },
        { name: "Profile", path: "/dashboard/patient/profile", icon: <UserCircleIcon className="h-5 w-5" /> },
        { name: "Settings", path: "/dashboard/patient/settings", icon: <Cog6ToothIcon className="h-5 w-5" /> },
        { name: "Alerts", path: "/dashboard/patient/alerts", icon: <BellIcon className="h-5 w-5" /> },
    ];


    return (
        <div className="flex flex-col justify-between h-full overflow-y-auto md:h-screen">
            <div>
                {/* Logo */}
                <div className="flex justify-center py-6">
                    <Image
                        src="/images/healthlane-logo-colored.png"
                        alt="HealthLane Logo"
                        width={170}
                        height={60}
                        priority
                    />
                </div>

                {/* Navigation */}
                <nav className="px-4 mt-4 space-y-1">
                    {menuItems.map((item) => {
                        const active = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${active
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-700 hover:text-primary hover:bg-gray-100"
                                    }`}
                            >
                                <span
                                    className={`${active ? "text-primary" : "text-gray-500 group-hover:text-primary"
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Info + Logout */}
            {user && (
                <div className="mt-auto border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        {userData?.photoURL ? (
                            <img
                                src={userData.photoURL}
                                alt={userData.preferredName || "Profile"}
                                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                {(userData?.preferredName?.[0] ||
                                    userData?.firstName?.[0] ||
                                    user?.email?.[0] ||
                                    "?"
                                ).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">
                                {userData?.preferredName || userData?.firstName || "Doctor"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-3 flex items-center gap-2 text-gray-500 hover:text-primary transition"
                    >
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}