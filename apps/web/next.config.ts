import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hulum/shared", "@voxide/react"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
