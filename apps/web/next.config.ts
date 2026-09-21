import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hulum/shared"],
  // Root ESLint flat config is the gate (`npm run lint`); skip Next’s embedded lint pass.
  eslint: { ignoreDuringBuilds: true },
  // Shared package exports use NodeNext `.js` specifiers; map them to source for webpack.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
