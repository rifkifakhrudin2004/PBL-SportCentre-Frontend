import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '**.ngrok-free.app',
      },
      {
        protocol: 'https',
        hostname: '**.ngrok-free.app',
      }
    ],
  },
};

export default nextConfig;
