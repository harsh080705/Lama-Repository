import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/Lama-Repository" : "",
  turbopack: {
    root: __dirname,
    resolveAlias: {
      "@": path.resolve(__dirname, "./src"),
    },
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  images: {
    unoptimized: true,
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
