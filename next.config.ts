import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gangwon.to",
        pathname: "/upload/board/**",
      },
      {
        protocol: "https",
        hostname: "cdn.imweb.me",
      },
      {
        protocol: "https",
        hostname: "cc2026wtpc.com",
      },
      {
        protocol: "https",
        hostname: "www.hongcheonrun.net",
      },
      {
        protocol: "https",
        hostname: "image.chosun.com",
      },
    ],
  },
};

export default nextConfig;
