const createNextConfig = require('../../packages/config/next.config.js');

module.exports = createNextConfig({
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
});
