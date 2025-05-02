import { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname), // Set the alias for @ to the root directory
    };
    return config;
  },
};

export default nextConfig;