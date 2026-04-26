/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      { protocol: "https", hostname: "ejdloezkivgvgsfdqpwc.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Compress responses
  compress: true,
  // Power header
  poweredByHeader: false,
  // Strict Content Security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
