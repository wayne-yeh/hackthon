/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083',
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'change-this-in-production',
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    NEXT_PUBLIC_ISSUER_TOKEN: process.env.NEXT_PUBLIC_ISSUER_TOKEN || 'change-this-in-production',
  },
  images: {
    domains: ['localhost', 'ipfs.io', 'gateway.pinata.cloud'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
