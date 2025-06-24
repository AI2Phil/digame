/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config.js');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  // Any other Next.js specific configs can go here
  webpack: (config, { isServer }) => {
    // Add any webpack specific configurations here if needed in the future.
    // For example, to handle SVGs:
    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: ["@svgr/webpack"]
    // });

    // Important for some server-side only modules, if you encounter issues.
    if (!isServer) {
      // Exclude server-only modules from client-side bundle
      // config.resolve.fallback = {
      //   ...config.resolve.fallback,
      //   fs: false, // example
      // };
    }
    return config;
  },
};

module.exports = nextConfig;
