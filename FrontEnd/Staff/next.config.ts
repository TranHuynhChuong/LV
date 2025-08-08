import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/ddwr8j9de/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
