export const locales = ["he", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "he";

export function dirForLocale(locale: string): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
