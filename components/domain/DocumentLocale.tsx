"use client";

import { useEffect } from "react";

function applyLocale(locale: "he" | "en") {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
}

/** Syncs html lang/dir from locale cookie and live language switches. */
export function DocumentLocale({
  initialLocale,
}: {
  initialLocale: "he" | "en";
}) {
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    const locale = (match?.[1] as "he" | "en" | undefined) ?? initialLocale;
    applyLocale(locale === "en" ? "en" : "he");

    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent<{ locale: "he" | "en" }>).detail;
      if (detail?.locale) applyLocale(detail.locale);
    };
    window.addEventListener("ols:locale", onLocale);
    return () => window.removeEventListener("ols:locale", onLocale);
  }, [initialLocale]);

  return null;
}
