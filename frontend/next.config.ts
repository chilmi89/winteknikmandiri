import type { NextConfig } from "next";

const minioInternalUrl =
  process.env.MINIO_INTERNAL_URL ||
  (process.env.NODE_ENV === "production"
    ? "http://minio:9000"
    : "http://127.0.0.1:9000");

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
        destination: `${minioInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
