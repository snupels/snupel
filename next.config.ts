import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "kw-marathon.com", pathname: "/theme/krf/img/**" },
      { protocol: "https", hostname: "koreawalk.kr", pathname: "/images/**" },
      { protocol: "https", hostname: "www.mullegil.com", pathname: "/data/mullegil/**" },
      { protocol: "https", hostname: "eventusstorage.blob.core.windows.net", pathname: "/evs/Image/**" },
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
      {
        protocol: "https",
        hostname: "tong.visitkorea.or.kr",
        pathname: "/cms/**",
      },
    ],
  },
};

export default nextConfig;
