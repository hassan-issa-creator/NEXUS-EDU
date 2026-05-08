import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Suppress type errors during production build
    ignoreBuildErrors: true,
  },
  // eslint key removed — not supported in Next.js 16 (use eslint.config.js)
};

export default withNextIntl(nextConfig);
