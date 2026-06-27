/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  transpilePackages: [
    '@engineering-copilot/types',
    '@engineering-copilot/db',
    '@engineering-copilot/prompt-engine',
  ],
}

module.exports = nextConfig
