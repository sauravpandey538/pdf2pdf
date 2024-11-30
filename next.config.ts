import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf2json"],
  },
};

export default nextConfig;
