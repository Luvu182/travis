import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@jarvis/config'],
  serverExternalPackages: ['bcrypt', 'pg'],
  allowedDevOrigins: ['https://jarvis.9solution.vn'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
