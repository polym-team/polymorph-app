/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@package/ui',
    '@package/utils',
    '@package/theme',
    '@polymorph/shared-auth',
  ],
};

module.exports = nextConfig;
