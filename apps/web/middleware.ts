import createIntlMiddleware from 'next-intl/middleware';

const LOCALES = ['en', 'it', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja'] as const;

export default createIntlMiddleware({
  locales: LOCALES as unknown as string[],
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
