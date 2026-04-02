/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@package/ui', '@package/utils'],
  serverExternalPackages: ['playwright', 'playwright-core'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amoremall.com' },
      { protocol: 'https', hostname: '**.innisfree.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
