const createNextConfig = require('../../packages/config/next.config.js');

module.exports = createNextConfig({
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
    ],
  },
});
