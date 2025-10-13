"use client";

import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Reusable toast trigger helpers
export const notify = {
  success: (msg: string) => toast.success(msg),
  warning: (msg: string) => toast.warning(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast.info(msg),
};

// 🎨 Unified HealthLane Toast styling
export const ToastConfig = () => (
  <ToastContainer
    position="top-center"
    autoClose={3000}
    hideProgressBar={false}
    closeOnClick
    pauseOnFocusLoss
    draggable
    pauseOnHover
    transition={Slide}
    theme="light"
    toastStyle={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "0.9rem",
      fontWeight: 400,
      padding: "18px 23px",
      boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
      lineHeight: "1.4",
    }}
    toastClassName={(context) => {
      const base =
        "relative flex items-start gap-2 rounded-lg p-4 shadow-md border overflow-hidden"; // 👈 overflow-hidden added
      switch (context?.type) {
        case "success":
          return `${base} bg-[#E8F8EF] text-[#1BAE69] border-[#1BAE69]`;
        case "warning":
          return `${base} bg-[#FFF8E5] text-[#B68900] border-[#FFB400]`;
        case "error":
          return `${base} bg-[#FDECEC] text-[#D32F2F] border-[#D32F2F]`;
        case "info":
          return `${base} bg-[#EAF4FF] text-[#0067B8] border-[#0081BF]`;
        default:
          return `${base} bg-white text-gray-800 border-gray-200`;
      }
    }}
    // ✅ keeps progress bar inside rounded corners
    progressClassName="!absolute !bottom-0 !left-0 !w-full !h-[3px] !rounded-b-lg !opacity-90"
    icon={({ type }) => {
      const size = 18;
      switch (type) {
        case "success":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#1BAE69"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
        case "warning":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#B68900"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.72A1 1 0 002.76 21h18.48a1 1 0 00.85-1.42L13.6 3.86a1 1 0 00-1.7 0z"
              />
            </svg>
          );
        case "error":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#D32F2F"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          );
        case "info":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#0067B8"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          );
        default:
          return null;
      }
    }}
  />
);