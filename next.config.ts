import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "places.googleapis.com",
        port: "",
        pathname: "/v1/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/blogg/beste-golfbaner-norge-2025",
        destination: "/blogg/beste-golfbaner-norge",
        permanent: true,
      },
      {
        source: "/blogg/beste-golfbaner-norge-2026",
        destination: "/blogg/beste-golfbaner-norge",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
