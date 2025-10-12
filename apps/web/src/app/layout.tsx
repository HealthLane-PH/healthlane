import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import RootWrapper from "./RootWrapper";
import { ToastConfig } from "../components/ToastConfig";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HealthLane PH",
  description: "Manage clinics, staff, and patients seamlessly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans bg-grayBg text-grayMid">
        <RootWrapper>{children}</RootWrapper>
        <ToastConfig />
      </body>
    </html>
  );
}