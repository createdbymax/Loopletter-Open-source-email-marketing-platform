import type { NextConfig } from "next";
import { fileURLToPath } from 'url';
import path from 'path';
import { createMDX } from 'fumadocs-mdx/next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX();

const nextConfig: NextConfig = {
  /* config options here */
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  experimental: {
    // Turbopack automatically handles PostCSS and Tailwind CSS
    // No need for custom rules with Tailwind v4
  },
  async rewrites() {
    // Only enable PostHog proxy in production to avoid development issues
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: "/ingest/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
        {
          source: "/ingest/decide",
          destination: "https://us.i.posthog.com/decide",
        },
      ];
    }
    return [];
  },
  webpack: (config, { isServer }) => {
    // Fix for WebSocket dependency issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        'ws/lib/receiver.js': false,
        'ws/lib/sender.js': false,
      };
    }

    return config;
  },
};

export default withMDX(nextConfig);