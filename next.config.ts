import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
    resolveAlias: {
      "@": path.resolve(__dirname, "./src"),
    },
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
