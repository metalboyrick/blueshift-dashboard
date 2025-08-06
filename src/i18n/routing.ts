import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en' /*, 'zh-hant' */, 'zh-cn'],
  defaultLocale: 'en'
});
