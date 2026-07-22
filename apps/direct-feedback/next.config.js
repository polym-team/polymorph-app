const createNextConfig = require('../../packages/config/next.config.js');

module.exports = createNextConfig({
  output: 'standalone',
  // 공유 config 의 base transpilePackages 를 덮어쓰므로 기존 항목도 함께 나열.
  // (공유 config 를 수정하면 다른 앱들이 불필요하게 재배포됨)
  transpilePackages: [
    '@package/ui',
    '@package/utils',
    '@polym-team/element-inspector',
  ],
});
