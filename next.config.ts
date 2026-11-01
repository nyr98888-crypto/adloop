import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic shells use cookies() for locale — keep classic SSR rendering
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
