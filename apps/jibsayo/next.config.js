const createNextConfig = require('../../packages/config/next.config.js');

module.exports = createNextConfig({
  // 앱별 추가 설정
  async redirects() {
    return [
      {
        source: '/',
        destination: '/transaction',
        permanent: false,
      },
    ];
  },
});
