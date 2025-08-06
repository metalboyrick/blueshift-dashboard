import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr' /*, 'zh-hant'*/],
  defaultLocale: 'en'
});
