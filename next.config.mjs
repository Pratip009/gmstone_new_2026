/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose", "csv-parser", "xlsx"], // ✅ correct key for Next.js 14.2.x
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*" },
      { protocol: "http", hostname: "*" },
    ],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET, // ✅ exposes to Edge middleware
  },
};

export default nextConfig;