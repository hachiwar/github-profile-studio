import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: [
    "@gps/core",
    "@gps/github",
    "@gps/generators",
    "@gps/cards",
    "@gps/achievements",
    "@gps/db"
  ]
};

export default nextConfig;
