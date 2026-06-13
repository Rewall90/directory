import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
        source: "/blog/beste-golfbaner-norge-2025",
        destination: "/blog/beste-golfbaner-norge",
        permanent: true,
      },
      {
        source: "/blog/beste-golfbaner-norge-2026",
        destination: "/blog/beste-golfbaner-norge",
        permanent: true,
      },
      // Viken was dissolved 2024-01-01 and split back into Akershus, Buskerud
      // and Østfold. Redirect the old county URLs to the courses' new homes.
      {
        source: "/viken/ballerud-golfklubb",
        destination: "/akershus/ballerud-golfklubb",
        permanent: true,
      },
      {
        source: "/en/viken/ballerud-golf",
        destination: "/en/akershus/ballerud-golf",
        permanent: true,
      },
      {
        source: "/viken",
        destination: "/regions",
        permanent: true,
      },
      {
        source: "/en/viken",
        destination: "/en/regions",
        permanent: true,
      },
      // Duplicate course entries consolidated to a single canonical URL.
      // Drammen Golfbane was a duplicate of Drammen Golfklubb (same club);
      // Rommen Golfklubb was a duplicate of Nes Golfklubb (same club).
      {
        source: "/viken/drammen-golfbane",
        destination: "/buskerud/drammen-golfklubb",
        permanent: true,
      },
      {
        source: "/en/viken/drammen-golf-course",
        destination: "/en/buskerud/drammen-golf-club",
        permanent: true,
      },
      {
        source: "/buskerud/drammen-golfbane",
        destination: "/buskerud/drammen-golfklubb",
        permanent: true,
      },
      {
        source: "/en/buskerud/drammen-golf-course",
        destination: "/en/buskerud/drammen-golf-club",
        permanent: true,
      },
      {
        source: "/akershus/rommen-golfklubb",
        destination: "/akershus/nes-golfklubb",
        permanent: true,
      },
      {
        source: "/en/akershus/nes-golf-club-rommen",
        destination: "/en/akershus/nes-golf-club",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
