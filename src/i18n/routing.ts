import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'vi' /*, 'zh-hant'*/],
  defaultLocale: 'en'
});
