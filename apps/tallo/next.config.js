/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@polymorph/shared-auth'],
};

module.exports = nextConfig;
