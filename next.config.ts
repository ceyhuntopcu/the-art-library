import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All data lives in the browser for this demo, so server prerender features are off.
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        // Arc components ship CSS modules; Tailwind only needs to process the global stylesheet.
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
