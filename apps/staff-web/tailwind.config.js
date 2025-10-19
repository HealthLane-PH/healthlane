/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",         // ✅ catches all pages inside /app and subfolders
    "./components/**/*.{js,ts,jsx,tsx,mdx}",  // ✅ safe even if you add components later
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}", // ✅ shared UI library (keep this)
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: "#1bae69",
        primaryDark: "#169a5f",
        grayDark: "#1B1B1B",
        grayMid: "#333333",
        grayBg: "#F8F8F8",
        grayLight: "#EEEEEE",
        accentOrange: "#FF8800",
        accentYellow: "#FFC900",
        accentBlue: "#0081BF",
        accentRed: "#FF5724",
        brandRed: "#F36D60",
        brandRedhover: "#FF9999",
        testPink: "#ff00ff",
        healthlaneblue: "#1761a4",
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      spacing: {
        18: "5rem", // ✅ custom spacing still fine
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};