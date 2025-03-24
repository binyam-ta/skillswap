/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['undici'],
  experimental: {
    serverComponentsExternalPackages: ['undici'],
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false
    };
    return config;
  }
};

module.exports = nextConfig;
