import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.STANDALONE === "true" ? { output: "standalone" as const } : {}),
  outputFileTracingExcludes: {
    "*": ["./dist-electron/**", "./electron/server/**"],
  },
};

export default nextConfig;
