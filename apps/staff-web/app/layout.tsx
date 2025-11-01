import "./globals.css";
import { Montserrat } from "next/font/google";
import { ToastConfig } from "@/components/ToastConfig";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "HealthLane Portal",
  description: "Staff portal for HealthLane",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} font-sans`}>
      <body>{children}</body>
      <ToastConfig />
    </html>
  );
}