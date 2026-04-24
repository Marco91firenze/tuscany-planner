import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@radix-ui/*', 'lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'api.sanity.io',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tuscany/core': require.resolve('../../packages/core/src/index.ts'),
      '@tuscany/db': require.resolve('../../packages/db/src/index.ts'),
      '@tuscany/i18n': require.resolve('../../packages/i18n/src/index.ts'),
      '@tuscany/ui-tokens': require.resolve('../../packages/ui-tokens/src/index.ts'),
    };
    return config;
  },
});
