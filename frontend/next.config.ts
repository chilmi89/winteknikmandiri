import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/faq",
        destination: "/#faq",
        permanent: false,
      },
      {
        source: "/dashboard/layanan",
        destination: "/dashboard/publik/layanan",
        permanent: true,
      },
      {
        source: "/dashboard/galeri",
        destination: "/dashboard/publik/galeri",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "http://127.0.0.1:9000/:path*",
      },
    ];
  },
};

export default nextConfig;
