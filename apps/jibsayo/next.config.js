/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@package/ui', '@package/utils'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/transaction',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
