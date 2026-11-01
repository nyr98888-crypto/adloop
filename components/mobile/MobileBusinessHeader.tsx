"use client";

import { BusinessSwitcher } from "@/components/desktop/BusinessSwitcher";
import type { Locale } from "@/lib/domain/types";

export function MobileBusinessHeader({
  locale,
  appName,
}: {
  locale: Locale;
  appName: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-base font-bold text-white">{appName}</p>
      <div className="mt-1">
        <BusinessSwitcher locale={locale} variant="header" />
      </div>
    </div>
  );
}
