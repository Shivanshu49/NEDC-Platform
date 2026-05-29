import type { NextConfig } from "next";

/**
 * Security response headers, applied to every route.
 *
 * The Content-Security-Policy is deliberately CONSERVATIVE: it allow-lists the
 * third parties we actually embed (Razorpay Checkout, Mux playback, Supabase)
 * and keeps 'unsafe-inline' for scripts/styles because Next injects inline
 * bootstrap script/style without a nonce. It still blocks any OTHER foreign
 * origin and (via frame-ancestors 'none') prevents clickjacking. A stricter
 * nonce-based CSP can be layered in later via the proxy/middleware if desired.
 */
const csp = [
  "default-src 'self'",
  // Razorpay Checkout widget loads from checkout.razorpay.com.
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  // Images: our hosts + Mux posters + the placeholder providers in remotePatterns.
  "img-src 'self' data: blob: https://*.supabase.co https://image.mux.com https://picsum.photos https://i.pravatar.cc https://images.unsplash.com",
  // Mux video streams.
  "media-src 'self' blob: https://stream.mux.com",
  // Supabase API/realtime, Razorpay, Mux.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://*.mux.com https://stream.mux.com",
  // Razorpay opens its checkout in an iframe.
  "frame-src https://checkout.razorpay.com https://api.razorpay.com",
  "font-src 'self' data:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'", // anti-clickjacking
].join("; ");

const securityHeaders = [
  // HSTS — force HTTPS for a year incl. subdomains. (Vercel serves HTTPS; this
  // makes browsers remember it. Safe because the app is HTTPS-only in prod.)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" }, // legacy clickjacking guard
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Domains next/image is allowed to optimize images from.
    remotePatterns: [
      // Placeholder images used by the seed data (swap for real ones later).
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage — for real images you upload later (any project ref).
      { protocol: "https", hostname: "**.supabase.co" },
      // Mux thumbnails/posters for recordings (Phase 5).
      { protocol: "https", hostname: "image.mux.com" },
    ],
  },
};

export default nextConfig;
