/** @type {import('next').NextConfig} */
import path from "path";

const isFirebase = process.env.TARGET === "firebase"; // 👈 Add this toggle

const nextConfig = {
  reactStrictMode: true,
  output: isFirebase ? "export" : "standalone", // 👈 Smart switch

  transpilePackages: ["@healthlane/auth"],

  // ✅ ignore build blockers during dev
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ key section for RN-Web + shared packages
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // 👇 Tell Next to use react-native-web instead of react-native
      "react-native$": "react-native-web",

      // 👇 Let Next resolve imports from shared packages (like /packages/ui)
      "@healthlane/ui": path.resolve("../../packages/ui"),
    };

    // 👇 Helps Next resolve RN/Web extensions automatically
    config.resolve.extensions.push(".web.js", ".web.ts", ".web.tsx");

    return config;
  },
};

export default nextConfig;