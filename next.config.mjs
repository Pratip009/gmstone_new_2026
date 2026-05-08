/** @type {import('next').NextConfig} */
const nextConfig = {
  
  serverExternalPackages: [
    "mongoose",
    "csv-parser",
    "xlsx",
  ],

  images: {
   
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },

      // Add more domains here if needed
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;