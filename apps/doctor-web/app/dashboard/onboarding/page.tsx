"use client";

import { useState, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import DoctorVerificationForm from "./DoctorVerificationForm";
import { auth, db } from "@/firebaseConfig";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { notify } from "@/components/ToastConfig";

export default function DoctorOnboarding() {
  const [played, setPlayed] = useState(false);
  useEffect(() => setPlayed(true), []);

  const [stepHeight, setStepHeight] = useState(90);

  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [doctorStatus, setDoctorStatus] = useState<"pending" | "approved" | null>(null);
  const [readyToAnimate, setReadyToAnimate] = useState(false);


  const fetchDoctorStatus = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const email = user.email?.trim().toLowerCase();
    const q = query(collection(db, "doctors"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      const status = docData.status || null;
      console.log("Fetched doctor status:", status);
      setDoctorStatus(status);
      setFormSubmitted(status === "pending" || status === "approved");
    } else {
      console.log("No doctor record found for:", email);
    }
  };

  useEffect(() => {
    if (doctorStatus === "pending" || doctorStatus === "approved") {
      setReadyToAnimate(true);
    }
  }, [doctorStatus]);


  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const email = user.email?.trim().toLowerCase();
    const q = query(collection(db, "doctors"), where("email", "==", email));

    // 🟢 Realtime listener for doctor record
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const status = docData.status || null;

        console.log("🔁 Realtime doctor status:", status);

        setDoctorStatus(status);
        setFormSubmitted(status === "pending" || status === "approved");
      } else {
        console.log("⚠️ No doctor document found for", email);
        setDoctorStatus(null);
        setFormSubmitted(false);
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (doctorStatus === "approved") {
      notify.success("✅ Your account has just been approved!");
    }
  }, [doctorStatus]);


  useEffect(() => {
    const updateHeight = () => {
      setStepHeight(window.innerWidth < 640 ? 120 : 90);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const steps = [

    {
      title: "Create user account",
      desc: "Create your doctor user account. If you are a patient and this was an accidental signup, click here.",
      completed: true,
    },
    {
      title: "List your practice",
      completed: true,
    },
    {
      title: "Pending verification",
      desc: "This process takes 1–2 business days. Hang tight!",
      completed: doctorStatus === "pending" || doctorStatus === "approved",
    },
    {
      title: "Ready to go live",
      desc: "Congratulations — you’re now a verified HealthLane partner!",
      completed: doctorStatus === "approved",
    },
  ];



  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      {/* Main onboarding content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-18 md:bg-white md:rounded-xl md:shadow-sm relative overflow-hidden w-full">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Doctor Onboarding
        </h1>
        <p className="text-center text-gray-500 mb-8">
          We’re setting up your HealthLane profile. You’ll be able to manage
          your queue once you’re verified.
        </p>

        <div className="relative ml-6">
          {/* === Animated vertical line === */}
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height:
                played && readyToAnimate
                  ? `calc(((${steps.filter((s) => s.completed).length} - 1) * ${stepHeight}px))`
                  : 0,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute left-[18px] top-[30px] w-[3px] bg-primary sm:left-[16px] sm:top-[28px]"
            style={{ maxHeight: "100%" }}
          />

          {/* === Steps === */}
          <ul className="space-y-9 sm:space-y-7">
            {steps.map((step, i) => (
              <li key={i} className="relative flex items-start">
                {/* Step icon */}
                <div className="mr-4 flex flex-col items-center z-10">
                  {step.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: played ? 1 : 0 }}
                      transition={{
                        delay: 0.3 + i * 0.25,
                        type: "spring",
                        stiffness: 120,
                        damping: 8,
                      }}
                      className="relative bg-[#F5F5F5] md:bg-white"
                    >
                      <CheckCircleIcon className="h-9 w-9 text-primary" />
                    </motion.div>
                  ) : (
                    <div className="min-h-[34px] min-w-[34px] rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-[13px] font-medium text-gray-400">
                      {i + 1}
                    </div>
                  )}
                </div>

                {/* Step text */}
                <div className="flex-1">
                  <p
                    className={`font-semibold ${step.completed ? "text-primary" : "text-gray-700"
                      }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[15px] sm:text-sm text-gray-500 mt-1 leading-snug">
                    {step.desc}
                  </p>

                  {/* ✅ Add “Submit your details” button under the second step */}
                  {i === 1 && (
                    <>
                      {!formSubmitted ? (
                        <button
                          onClick={() => setShowForm(true)}
                          className="mt-0 bg-primary text-white text-sm font-medium px-5 py-2 rounded-md shadow-sm hover:bg-primaryDark transition"
                        >
                          Submit your details
                        </button>
                      ) : (
                        <p className="mt-6 italic text-green-600 text-sm">
                          Your verification request has been submitted.
                        </p>
                      )}
                    </>
                  )}

                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DoctorVerificationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          console.log("✅ Toast finished — refreshing doctor status & starting animation...");
          fetchDoctorStatus(); // Refresh Firestore doctor status immediately

          // Delay tracker animation until after toast visually finishes
          setTimeout(() => {
            setReadyToAnimate(true); // allow animation to show
            setPlayed(false); // reset animation
            setTimeout(() => setPlayed(true), 50); // re-play it
          }, 2200); // adjust to your toast duration if needed
        }}
      />

    </div>
  );
}
