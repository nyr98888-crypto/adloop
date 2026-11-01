import type { AppLocale } from "@/lib/i18n/config";
import he from "@/messages/he.json";
import en from "@/messages/en.json";

const dictionaries = { he, en };

export type Dictionary = typeof he;

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries.he;
}
