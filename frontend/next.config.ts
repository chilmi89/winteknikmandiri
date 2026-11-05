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
};

export default nextConfig;
