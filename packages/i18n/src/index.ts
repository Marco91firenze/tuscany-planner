import enDict from './dictionaries/en.json';

export const LOCALES = ['en', 'it', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];

export const dictionaries: Record<Locale, Record<string, string>> = {
  en: enDict,
  it: {},
  fr: {},
  de: {},
  es: {},
  pt: {},
  ru: {},
  zh: {},
  ja: {},
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.en;
}

export function translate(locale: Locale, key: string, fallback?: string): string {
  const dict = getDictionary(locale);
  return dict[key] || fallback || key;
}
