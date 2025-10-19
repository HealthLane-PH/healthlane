"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserIcon,
    HeartIcon,
    BuildingOffice2Icon,
    ClipboardDocumentCheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { notify } from "@/components/ToastConfig";
import { toast } from "react-toastify";

import { auth, db, storage } from "@/firebaseConfig";
import type { LucideIcon } from "lucide-react"; // 👈 Add this line

import {
    User,
    Heart,
    Building2,
    ClipboardCheck,
    X,
} from "lucide-react";

import {
    collection,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

type HeroIcon = React.ComponentType<React.ComponentProps<"svg">>;



// ====================
// Floating Label Input
// ====================
const FloatingInput = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    required = false,
    placeholder = " ",
}: any) => (
    <div className="relative w-full">
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder=" "
            required={required}
            className="peer w-full border border-gray-300 rounded-lg px-3 pt-[1.8rem] pb-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        <label
            htmlFor={name}
            className="absolute text-gray-500 text-sm left-3 top-2.5 transition-all duration-200
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400
        peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary"
        >
            {label}
        </label>
    </div>
);

// ====================
// Progress Tracker
// ====================
const steps = [
    { icon: User },
    { icon: Heart },
    { icon: Building2 },
    { icon: ClipboardCheck },
];


// ====================
// MAIN COMPONENT
// ====================
export default function DoctorVerificationForm({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const [step, setStep] = useState(1);

    const displayName = auth.currentUser?.displayName || "";
    const nameParts = displayName.split(" ");

    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : displayName;
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    const [form, setForm] = useState({
        firstName,
        middleName: "",
        lastName,
        suffix: "",
        titles: "",
        specializations: [] as string[],
        clinics: [{ name: "", buildingStreet: "", city: "Naga City", province: "Camarines Sur" }],
        prcFile: null as File | null,
        consent: false,
    });



    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [showConsentModal, setShowConsentModal] = useState(false);



    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setPreviewUrl(null);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const formatted =
            ["firstName", "middleName", "lastName", "suffix"].includes(name)
                ? value.charAt(0).toUpperCase() + value.slice(1)
                : value;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : formatted,
        }));
    };

    const addClinic = () => {
        setForm((prev) => ({
            ...prev,
            clinics: [...prev.clinics, { name: "", buildingStreet: "", city: "Naga City", province: "Camarines Sur" }],
        }));
    };

    const handleClinicChange = (i: number, field: string, value: string) => {
        const next = [...form.clinics];
        next[i] = { ...next[i], [field]: value };
        setForm((prev) => ({ ...prev, clinics: next }));
    };

    const removeClinic = (i: number) =>
        setForm((prev) => ({
            ...prev,
            clinics: prev.clinics.filter((_, index) => index !== i),
        }));

    const handleSpecializationAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val && !form.specializations.includes(val)) {
            setForm((prev) => ({ ...prev, specializations: [...prev.specializations, val] }));
        }
    };

    const handleSubmit = async () => {
        if (!form.prcFile) return notify.warning("Please upload your PRC ID first!");
        if (!form.consent) return notify.warning("You must agree to the consent form.");

        setLoading(true);
        try {
            const user = auth.currentUser;
            const email = user?.email?.trim().toLowerCase();

            if (!user || !email) {
                notify.warning("User not authenticated or missing email.");
                setLoading(false);
                return;
            }

            const file = form.prcFile;
            const fileRef = ref(storage, `prcIDs/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            await new Promise<void>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                    },
                    reject,
                    resolve
                );
            });

            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            const { prcFile, ...cleanForm } = form;

            // 🟢 Include email + uid so doctor records can be matched later
            await addDoc(collection(db, "doctors"), {
                ...cleanForm,
                prcFileURL: downloadURL,
                status: "pending", // ✅ triggers onboarding progress
                email: auth.currentUser?.email || "",
                createdAt: serverTimestamp(),
            });

            // 🟢 Advance to step 3 visually
            setStep(3);

            // 🔔 Show success toast
            notify.success("Your verification has been submitted!");

            // 🕒 Immediately close modal (don’t wait for toast)
            onClose();

            // 🧭 Wait until toast finishes before triggering animation
            const TOAST_DURATION = 3000; // matches ToastConfig autoClose={3000}

            // Subscribe to toast changes only once
            const unsubscribe = toast.onChange((event) => {
                if (event.status === "removed" && event.type === "success") {
                    console.log("✅ Toast finished — triggering tracker animation...");
                    onSuccess?.(); // triggers parent animation/tracker
                    unsubscribe(); // cleanup listener after it fires once
                }
            });

        } catch (err) {
            console.error(err);
            notify.warning("Error submitting verification form.");
        } finally {
            setLoading(false);
        }
    };



    const canProceed =
        (step === 1 &&
            form.firstName.trim() &&
            form.lastName.trim()) ||
        (step === 2 && form.specializations.length > 0) ||
        (step === 3 && form.clinics[0].name.trim() && form.clinics[0].buildingStreet.trim()) ||
        (step === 4 && form.prcFile && form.consent);

    if (!isOpen) return null;

    // Step transition animation
    const stepMotion = {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
        transition: { duration: 0.3 },
    };

    type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

    const StepIcon = ({
        IconComponent,
        active,
    }: {
        IconComponent: LucideIcon; // 👈 Use LucideIcon instead of React.FC
        active: boolean;
    }) => (
        <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-sm transition-all duration-300 ${active
                ? "bg-primary text-white border-primary"
                : "bg-white border-gray-300 text-gray-400"
                }`}
        >
            <IconComponent className="w-5 h-5" />
        </div>
    );





    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
                className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Header */}
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    Doctor Verification
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                    Step-by-step verification
                </p>

                {/* Progress Tracker */}
                <div className="relative flex items-center justify-between mb-8 px-8">
                    {/* Gray base line */}
                    <div className="absolute top-[58%] left-[10%] right-[10%] h-[3px] bg-gray-200 z-0 rounded-full"></div>

                    {/* Animated progress line */}
                    <motion.div
                        className="absolute top-[58%] left-[11%] h-[3px] bg-primary z-[1] rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                            width:
                                step === 1
                                    ? "0%"
                                    : step === steps.length
                                        ? "78%"
                                        : `${(step - 1) * 26}%`,
                        }}
                        transition={{ duration: 0.4 }}
                    />


                    {/* Step icons on top */}
                    <div className="flex justify-between w-full relative z-[2]">
                        {steps.map((s, i) => (
                            <StepIcon key={i} IconComponent={s.icon} active={i + 1 <= step} />
                        ))}

                    </div>
                </div>


                {/* Steps */}
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" {...stepMotion}>
                            <h3 className="font-semibold text-gray-800 mb-3">
                                Personal Details
                            </h3>
                            <div className="space-y-3">
                                <FloatingInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
                                <FloatingInput label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
                                <FloatingInput label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
                                <FloatingInput label="Suffix (optional)" name="suffix" value={form.suffix} onChange={handleChange} />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" {...stepMotion}>
                            <h3 className="font-semibold text-gray-800 mb-3">
                                Doctor Information
                            </h3>

                            {/* 👇 Prefilled email, read-only */}
                            <div className="relative w-full mb-3 opacity-80">
                                <input
                                    type="email"
                                    value={auth.currentUser?.email || ""}
                                    readOnly
                                    className="peer w-full border border-gray-300 rounded-lg px-3 pt-[1.8rem] pb-2 text-sm bg-gray-50 cursor-not-allowed"
                                />
                                <label className="absolute text-gray-500 text-sm left-3 top-2.5">
                                    Email (read-only)
                                </label>
                            </div>

                            <FloatingInput
                                label="Post-nominal Titles (e.g. MD, FPPA)"
                                name="titles"
                                value={form.titles}
                                onChange={handleChange}
                            />

                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Specializations
                                </label>
                                <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg px-2 py-2">
                                    {form.specializations.map((s, i) => (
                                        <span
                                            key={i}
                                            className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1"
                                        >
                                            {s}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        specializations: prev.specializations.filter(
                                                            (_, idx) => idx !== i
                                                        ),
                                                    }))
                                                }
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                    <select
                                        className="bg-transparent text-sm cursor-pointer"
                                        onChange={handleSpecializationAdd}
                                        value=""
                                    >
                                        <option value="" disabled>
                                            + Add specialization
                                        </option>
                                        {[
                                            "General Medicine",
                                            "Pediatrics",
                                            "Cardiology",
                                            "Dermatology",
                                            "Obstetrics and Gynecology",
                                            "Neurology",
                                            "Orthopedics",
                                            "Psychiatry",
                                        ].map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}


                    {step === 3 && (
                        <motion.div key="step3" {...stepMotion}>
                            <h3 className="font-semibold text-gray-800 mb-3">Clinic Information</h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {form.clinics.map((c, i) => (
                                    <div key={i} className="border border-gray-200 p-3 rounded-lg space-y-2">
                                        <FloatingInput
                                            label="Clinic Name"
                                            name={`clinicName${i}`}
                                            value={c.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleClinicChange(i, "name", e.target.value)
                                            }

                                            required
                                        />
                                        <FloatingInput
                                            label="Building & Street"
                                            name={`buildingStreet${i}`}
                                            value={c.buildingStreet}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleClinicChange(i, "buildingStreet", e.target.value)
                                            }

                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <FloatingInput label="City" name={`city${i}`} value={c.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleClinicChange(i, "city", e.target.value)
                                            }
                                            />
                                            <FloatingInput label="Province" name={`province${i}`} value={c.province} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleClinicChange(i, "province", e.target.value)
                                            }
                                            />
                                        </div>
                                        {form.clinics.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeClinic(i)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Remove clinic
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addClinic}
                                className="text-primary text-sm hover:underline mt-3"
                            >
                                + Add another location
                            </button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" {...stepMotion}>
                            <h3 className="font-semibold text-gray-800 mb-3">Verification & Consent</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                Upload your PRC ID to verify your credentials.
                            </p>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer border border-primary text-primary hover:bg-primary/5 text-sm px-4 py-2 rounded-md">
                                    {previewUrl ? "Replace Photo" : "Upload Photo"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setForm((prev) => ({ ...prev, prcFile: file }));
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewUrl(null);
                                            setForm((prev) => ({ ...prev, prcFile: null }));
                                        }}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="mt-3 w-40 rounded-lg border"
                                />
                            )}
                            <label className="flex items-start gap-2 mt-5 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="consent"
                                    checked={form.consent}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                                <span>
                                    I agree to the terms outlined in the{" "}
                                    <button
                                        type="button"
                                        onClick={() => setShowConsentModal(true)}
                                        className="text-primary underline hover:text-primaryDark"
                                    >
                                        Consent Form
                                    </button>

                                    .
                                </span>
                            </label>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between border-t pt-4">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                        >
                            Back
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                    {step < 4 ? (
                        <button
                            disabled={!canProceed}
                            onClick={() => {
                                if (!canProceed) {
                                    notify.warning("Please fill in all required fields before continuing.");
                                    return;
                                }
                                setStep(step + 1);
                            }}
                            className={`px-5 py-2.5 rounded-md text-white ${canProceed ? "bg-primary hover:bg-primaryDark" : "bg-gray-300 cursor-not-allowed"
                                }`}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-white ${loading ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primaryDark"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                "Get Verified"
                            )}
                        </button>

                    )}
                </div>

                {/* Consent Modal */}
                {showConsentModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                            <button
                                onClick={() => setShowConsentModal(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Consent Form</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                This is a placeholder for your Consent Form content. You can link to a PDF or embed the form details here.
                            </p>
                            <button
                                onClick={() => setShowConsentModal(false)}
                                className="w-full bg-primary hover:bg-primaryDark text-white rounded-md py-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
