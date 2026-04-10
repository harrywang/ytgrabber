import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": ["./dist-electron/**", "./electron/server/**"],
  },
};

export default nextConfig;
