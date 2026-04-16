import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Turbopack config structure may not be typed correctly in this Next.js version
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
