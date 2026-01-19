/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@package/ui', '@package/utils'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/transactions',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
