import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Property photos come from Sanity's asset CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
