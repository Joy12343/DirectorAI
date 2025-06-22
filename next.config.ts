import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger base64 JSON uploads
    },
  },
};

export default nextConfig;
