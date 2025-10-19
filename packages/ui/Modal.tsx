"use client";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dim backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Centered modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className="relative bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] p-0 sm:p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button (Apple-style circular) */}
              <button
                onClick={onClose}
                className="absolute -top-4 -right-4 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Actual form (children) */}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}