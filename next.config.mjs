/** @type {import('next').NextConfig} */
const nextConfig = {
  // the site's scripts run once on load; strict mode would run them twice in development
  reactStrictMode: false,
  async headers() {
    return [
      { source: "/models/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/videos/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
      { source: "/assets/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
    ];
  },
};

export default nextConfig;
