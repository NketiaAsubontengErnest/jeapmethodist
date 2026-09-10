import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Same-origin API in dev is a different port (localhost:4000), so it needs
// its own connect-src/img-src entry; in production NEXT_PUBLIC_API_URL will
// point at the real API host instead.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").origin;
  } catch {
    return "http://localhost:4000";
  }
})();

const csp = [
  `default-src 'self'`,
  // Next.js injects inline hydration/runtime scripts; a strict nonce-based
  // policy needs middleware wiring we don't have yet, so 'unsafe-inline' is
  // the pragmatic middle ground here. 'unsafe-eval' is dev-only (HMR/Fast Refresh).
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  // images.unsplash.com is only used for placeholder/demo content on the
  // public pages — safe to drop once real photos replace it.
  `img-src 'self' data: blob: https://images.unsplash.com ${apiOrigin}`,
  `connect-src 'self' ${apiOrigin}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isProd ? [`upgrade-insecure-requests`] : []),
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
