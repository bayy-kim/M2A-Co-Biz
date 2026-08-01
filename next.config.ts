import type { NextConfig } from "next"

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://images.unsplash.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self';
  frame-src 'self' https://www.google.com;
  frame-ancestors 'none';
  base-uri 'self';
  object-src 'none';
`.replace(/\s+/g, " ").trim()

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      // Private routes: allow browser back/forward cache (bfcache) while keeping data out of shared caches
      ...[
        "/dashboard-buyer/:path*",
        "/profil",
        "/profil/:path*",
        "/pesanan-saya/:path*",
        "/seller/:path*",
        "/admin/:path*",
        "/bendahara/:path*",
        "/ketua/:path*",
      ].map((source) => ({
        source,
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, max-age=0, must-revalidate",
          },
        ],
      })),
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "0",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ]
  },
}

export default nextConfig
