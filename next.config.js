/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "pdf-parse"],
  },
};

module.exports = nextConfig;
