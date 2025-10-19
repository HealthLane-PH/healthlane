/** @type {import('next').NextConfig} */
import path from "path";

const isFirebase = process.env.TARGET === "firebase";

const nextConfig = {
  reactStrictMode: true,
  output: isFirebase ? "export" : "standalone",

  transpilePackages: ["@healthlane/auth"],

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
      "@healthlane/ui": path.resolve("../../packages/ui"),
    };
    config.resolve.extensions.push(".web.js", ".web.ts", ".web.tsx");
    return config;
  },
};

export default nextConfig;