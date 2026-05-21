/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@package/ui', '@package/utils', '@polymorph/shared-auth'],
};

module.exports = nextConfig;
