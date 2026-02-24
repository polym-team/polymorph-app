const createNextConfig = require('../../packages/config/next.config.js');

module.exports = createNextConfig({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
});
