import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "export",
  distDir: "out/renderer",
};

export default nextConfig;
