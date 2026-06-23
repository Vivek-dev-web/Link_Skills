const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

module.exports = withPWA({
  dest: "public",
  // Service worker is only active in production — dev still hot-reloads normally
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Never cache API routes or auth endpoints regardless of deploy URL
  runtimeCaching: [
    {
      urlPattern: /\/api\//,
      handler: "NetworkOnly",
    },
  ],
})(nextConfig);
