import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/locale";
import { LocaleSwitcher } from "@/components/domain/LocaleSwitcher";
import { NetworkSettings } from "@/components/desktop/settings/NetworkSettings";
import { BusinessConstants } from "@/components/desktop/settings/BusinessConstants";

export default async function SettingsPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">{t.nav.settings}</h1>

      <section className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">
          {locale === "he" ? "שפה" : "Language"}
        </h2>
        <LocaleSwitcher locale={locale} variant="onLight" />
      </section>

      <BusinessConstants locale={locale} />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          {locale === "he" ? "רשתות חברתיות" : "Social networks"}
        </h2>
        <NetworkSettings locale={locale} />
      </section>
    </div>
  );
}
