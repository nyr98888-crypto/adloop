import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LocaleSwitcher } from "@/components/domain/LocaleSwitcher";
import { MobileBusinessHeader } from "@/components/mobile/MobileBusinessHeader";

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col bg-brand-canvas">
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 text-white shadow-sm"
        style={{
          backgroundImage: "linear-gradient(to left, #0284FE 0%, #005AC2 100%)",
        }}
      >
        <MobileBusinessHeader locale={locale} appName={t.app.name} />
        <LocaleSwitcher locale={locale} />
      </header>

      <main className="w-full flex-1 px-4 py-5">{children}</main>

      <nav className="sticky bottom-0 grid grid-cols-3 gap-1 border-t border-brand-soft bg-brand-surface px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Link
          href="/m"
          className="rounded-lg px-2 py-2.5 text-center text-sm font-semibold text-[#0077F6]"
        >
          {locale === "he" ? "יצירה" : "Create"}
        </Link>
        <Link
          href="/m/studio"
          className="rounded-lg px-2 py-2.5 text-center text-sm font-semibold text-[#0077F6]"
        >
          {locale === "he" ? "פוסטים" : "Posts"}
        </Link>
        <Link
          href="/d/settings"
          className="rounded-lg px-2 py-2.5 text-center text-sm font-semibold text-[#0077F6]"
        >
          {locale === "he" ? "הגדרות" : "Settings"}
        </Link>
      </nav>
    </div>
  );
}
