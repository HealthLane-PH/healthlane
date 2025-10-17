/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",      // ✅ watch the app folder you just moved
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // optional if you have shared ones here
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media',
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
        brandRedHover: "#FF9999",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "5rem", // adds a new option for custom sizes
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

