import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/config";

/** Only call from dynamic/server pages inside Suspense or with instant=false */
export async function resolveLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("locale")?.value;
  if (fromCookie && isAppLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const accept = headerStore.get("accept-language") ?? "";
  if (accept.toLowerCase().startsWith("en")) return "en";
  return defaultLocale;
}
