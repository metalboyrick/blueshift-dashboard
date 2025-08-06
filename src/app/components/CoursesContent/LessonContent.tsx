"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function LessonContent({
  locale,
  originalLocale,
  children,
}: {
  locale: string;
  originalLocale:string;
  children: React.ReactNode;
}) {
  const t = useTranslations("notifications");

  useEffect(() => {
    if (locale !== originalLocale) {
      toast.success(t("content_fallback"));
    }
  }, [locale, originalLocale, t]);

  return <>{children}</>;
}
