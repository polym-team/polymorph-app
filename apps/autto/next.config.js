/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@package/ui', '@package/utils', '@polymorph/shared-auth'],
  logging: {
    fetches: { fullUrl: true },
    incomingRequests: true,
  },
};

module.exports = nextConfig;
