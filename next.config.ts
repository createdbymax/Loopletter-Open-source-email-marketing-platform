import type { NextConfig } from "next";
import { fileURLToPath } from 'url';
import path from 'path';
import { createMDX } from 'fumadocs-mdx/next';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withMDX = createMDX();
const nextConfig: NextConfig = {
    skipTrailingSlashRedirect: true,
    experimental: {},
    async rewrites() {
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
        config.externals = config.externals || [];
        config.externals.push(/^supabase\/functions/);
        return config;
    },
};
export default withMDX(nextConfig);
