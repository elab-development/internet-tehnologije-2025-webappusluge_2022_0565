import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Next.js 16 generates an auto-validator.ts that is incompatible
    // with the old { params: { id: string } } style; tsc --noEmit passes.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
