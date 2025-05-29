/** @type {import('next').NextConfig} */
const createNextConfig = (customConfig = {}) => {
  const baseConfig = {
    transpilePackages: ['@package/ui', '@package/utils'],
  };

  return {
    ...baseConfig,
    ...customConfig,
  };
};

module.exports = createNextConfig;
