/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Server-side env vars (not exposed to browser)
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
