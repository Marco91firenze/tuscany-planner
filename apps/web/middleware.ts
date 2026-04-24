import createIntlMiddleware from 'next-intl/middleware';
import { LOCALES } from '@tuscany/i18n';

export default createIntlMiddleware({
  locales: LOCALES,
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
