import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  turbopack: {}, // Enable Turbopack with empty config to avoid webpack conflict
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgcdnmi.dramaboxdb.com",
      },
      {
        protocol: "https",
        hostname: "hwztchapter.dramaboxdb.com",
      },
      {
        protocol: "https",
        hostname: "awscover.netshort.com",
      },
      {
        protocol: "https",
        hostname: "static.netshort.com",
      },
      {
        protocol: "https",
        hostname: "cover.netshort.com",
      },
      {
        protocol: "https",
        hostname: "alicdn.netshort.com",
      },
      {
        protocol: "https",
        hostname: "zshipubcdn.farsunpteltd.com",
      },
      {
        protocol: "https",
        hostname: "zshipricf.farsunpteltd.com",
      },
      {
        protocol: "https",
        hostname: "v-mps.crazymaplestudios.com",
      },
      {
        protocol: "https",
        hostname: "assets.animekita.org",
      },
      {
        protocol: "https",
        hostname: "otakudesu.best",
      },
    ],
    unoptimized: true,
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
})(nextConfig);

