"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "@/components/domain/LocaleSwitcher";
import { BusinessSwitcher } from "@/components/desktop/BusinessSwitcher";
import type { Locale } from "@/lib/domain/types";

const links = [
  { href: "/d", key: "home" },
  { href: "/d/dashboard", key: "dashboard" },
  { href: "/d/calendar", key: "calendar" },
  { href: "/d/reviews", key: "reviews" },
  { href: "/d/analytics", key: "analytics" },
  { href: "/d/settings", key: "settings" },
] as const;

export function SidebarNav({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Record<(typeof links)[number]["key"] | "name" | "tagline" | "mobile", string>;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col text-white md:flex"
      style={{
        backgroundImage: "linear-gradient(to bottom, #0077F6 0%, #0052CC 100%)",
      }}
    >
      <div className="border-b border-white/20 px-5 py-5">
        <p className="text-lg font-bold tracking-tight text-white">{labels.name}</p>
        <p className="mb-3 text-xs text-white/80">{labels.tagline}</p>
        <BusinessSwitcher locale={locale} variant="sidebar" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((l) => {
          const active =
            l.href === "/d" ? pathname === "/d" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition ${
                active
                  ? "bg-white/25 ring-1 ring-brand-soft"
                  : "hover:bg-[#4DACFF]/35"
              }`}
            >
              {labels[l.key]}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/20 p-4">
        <LocaleSwitcher locale={locale} />
        <Link
          href="/m"
          className="mt-3 block text-xs text-white/80 hover:text-white"
        >
          {labels.mobile}
        </Link>
      </div>
    </aside>
  );
}
