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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    qualities: [75, 85],
  },
};

export default nextConfig;
