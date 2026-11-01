"use client";

import Link from "next/link";
import { LocaleSwitcher } from "@/components/domain/LocaleSwitcher";
import { BusinessSwitcher } from "@/components/desktop/BusinessSwitcher";
import type { Locale } from "@/lib/domain/types";

/**
 * On viewports < md, desktop chrome is replaced by a mobile-style top bar
 * so /d never squeezes content beside a pinned sidebar.
 */
export function MobileDesktopFallback({
  locale,
}: {
  locale: Locale;
  businessName?: string;
}) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 text-white md:hidden"
      style={{
        backgroundImage: "linear-gradient(to left, #0284FE 0%, #005AC2 100%)",
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">One Loop Social</p>
        <div className="mt-1">
          <BusinessSwitcher locale={locale} variant="header" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LocaleSwitcher locale={locale} />
        <Link
          href="/m"
          className="rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-semibold text-white ring-1 ring-brand-soft"
        >
          {locale === "he" ? "אפליקציה" : "App"}
        </Link>
      </div>
    </header>
  );
}
