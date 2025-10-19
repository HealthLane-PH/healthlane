/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",     // All Next.js apps
    "./packages/**/*.{js,ts,jsx,tsx,mdx}", // Shared UI packages
    "./src/**/*.{js,ts,jsx,tsx,mdx}",      // Root src
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
        brandRedhover: "#FF9999",
        testPink: "#ff00ff",
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

