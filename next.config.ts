import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Helps Capacitor load nested routes from the static export correctly.
  trailingSlash: true,
};

export default nextConfig;
