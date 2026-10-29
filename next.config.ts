import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // YouTube thumbnails for past Shiloh ministrations.
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
};

export default nextConfig;
