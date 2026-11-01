"use client";

import { useEffect, useState } from "react";
import { SidebarNav } from "@/components/desktop/SidebarNav";
import { MobileDesktopFallback } from "@/components/desktop/MobileDesktopFallback";
import type { Locale } from "@/lib/domain/types";

/**
 * Mirrors chrome by locale:
 * he → dir=rtl, sidebar anchored on the right (flex-start in RTL)
 * en → dir=ltr, sidebar anchored on the left
 */
export function DesktopShell({
  locale: serverLocale,
  labels,
  businessName,
  children,
}: {
  locale: Locale;
  labels: Record<
    "home" | "dashboard" | "calendar" | "reviews" | "analytics" | "settings" | "name" | "tagline" | "mobile",
    string
  >;
  businessName: string;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(serverLocale);

  useEffect(() => {
    setLocale(serverLocale);
  }, [serverLocale]);

  useEffect(() => {
    const onLocale = (e: Event) => {
      const next = (e as CustomEvent<{ locale: Locale }>).detail?.locale;
      if (next === "he" || next === "en") setLocale(next);
    };
    window.addEventListener("ols:locale", onLocale);
    return () => window.removeEventListener("ols:locale", onLocale);
  }, []);

  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale} className="flex min-h-full w-full bg-[#F8FAFC]">
      <SidebarNav locale={locale} labels={labels} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileDesktopFallback locale={locale} businessName={businessName} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 text-start md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
