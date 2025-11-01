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
  Building2Icon,
  UsersIcon,
  UserCogIcon,
  InboxIcon,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { name: "Home", path: "/staff/dashboard", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Facilities", path: "/staff/clinics", icon: <Building2Icon className="h-5 w-5" /> },
  { name: "Patients", path: "/staff/patients", icon: <UsersIcon className="h-5 w-5" /> },
  { name: "Staff", path: "/staff/staff-members", icon: <UserCogIcon className="h-5 w-5" /> },
  { name: "Support Tickets", path: "/staff/inbox", icon: <InboxIcon className="h-5 w-5" /> },
];

interface FirestoreStaff {
  displayname?: string;
  firstname?: string;
  email?: string;
  photoURL?: string;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [staffData, setStaffData] = useState<FirestoreStaff | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);

        // 🔍 Try by UID first
        const staffRef = doc(db, "staff", u.uid);
        const staffSnap = await getDoc(staffRef);

        if (staffSnap.exists()) {
          setStaffData(staffSnap.data() as FirestoreStaff);
        } else {
          // 🔍 Fallback: query by email (in case of auto-ID docs)
          const q = query(collection(db, "staff"), where("email", "==", u.email));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            setStaffData(querySnap.docs[0].data() as FirestoreStaff);
          }
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // ✅ fixed redirect path
  };

  const displayName =
    staffData?.displayname || staffData?.firstname || "Staff User";

  const photoURL =
    staffData?.photoURL || "/images/default-avatar.png"; // ✅ fallback

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gray-900">
      <div>
        {/* Logo */}
        <div className="flex items-center justify-center py-6">
          <Image
            src="/images/healthlane-logo-white.png"
            alt="HealthLane Logo"
            width={180}
            height={77}
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={onClose}
              className={`group flex items-center space-x-2 px-3 py-2 rounded-md transition ${
                pathname === item.path
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span
                className={`${
                  pathname === item.path
                    ? "text-[#00A651]"
                    : "text-gray-400 group-hover:text-white"
                } transition-colors`}
              >
                {item.icon}
              </span>
              <span className="ml-2">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Staff info + logout */}
      {user && (
        <div className="mt-auto border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-gray-600"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                {(displayName.charAt(0) || "?").toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-white">{displayName}</p>
              <button
                onClick={handleLogout}
                className="mt-1 flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}