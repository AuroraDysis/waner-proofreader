import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ["react-monaco-editor"],
};

export default nextConfig;
