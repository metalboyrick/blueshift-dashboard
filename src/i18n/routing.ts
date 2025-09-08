import { defineRouting } from "next-intl/routing";

export const localeNames = {
  en: "English",
  "zh-CN": "简体中文",
  fr: "Français",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
  uk: "Українська",
  de: "Deutsch"
};

export const routing = defineRouting({
  locales: ["en", "zh-CN", "fr", "id", "vi", "uk", "de"],
  defaultLocale: "en",
});
