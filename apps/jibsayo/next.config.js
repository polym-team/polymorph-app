/** @type {import('next').NextConfig} */
const nextConfig = {
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
