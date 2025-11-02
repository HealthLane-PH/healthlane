import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Montserrat } from "next/font/google";
import RootWrapper from "./RootWrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "HealthLane Staff Portal",
  description: "Manage clinics, staff, and patients seamlessly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} font-sans`}>
      <body className="bg-gray-900 text-white">
        <RootWrapper>{children}</RootWrapper>
      </body>
    </html>
  );
}