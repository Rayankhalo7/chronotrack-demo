/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 blocks cross-origin /_next from 127.0.0.1 vs localhost; Next 14 may ignore.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
