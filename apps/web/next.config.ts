import type { NextConfig } from 'next';

/**
 * Extra hosts allowed to load dev resources, for opening the dev server from
 * another device on the network (e.g. ALLOWED_DEV_ORIGINS=192.168.0.135).
 * Next blocks cross-origin dev requests by default, and a blocked request
 * takes the client chunks with it: the page renders, but client components
 * such as the recharts charts never hydrate. Dev only; builds are unaffected.
 */
const ALLOWED_DEV_ORIGINS = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin !== '');

const nextConfig: NextConfig = {
  transpilePackages: ['@nzlab/ui'],
  typedRoutes: true,
  devIndicators: false,
  allowedDevOrigins: ALLOWED_DEV_ORIGINS,
  // The site is a static export (no server), so the app exports to plain
  // HTML. The base path stays empty for local dev and Vercel builds so URLs
  // remain root-relative.
  output: 'export',
  // Story routes become <slug>/index.html so the static host serves
  // /<category>/<slug>/ without an .html extension.
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
