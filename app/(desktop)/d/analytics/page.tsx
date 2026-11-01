import { PulseCards } from "@/components/desktop/analytics/PulseCards";
import { demoPulse } from "@/lib/demo/store";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/locale";

export default async function AnalyticsPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">{t.nav.analytics}</h1>
      <p className="text-sm text-slate-500">
        {locale === "he"
          ? "ארבעה כרטיסים · לחצו על שורת רשת לפירוט"
          : "Four cards · click a network row for details"}
      </p>
      <PulseCards
        pulse={demoPulse}
        locale={locale}
        labels={{
          topPost: t.analytics.topPost,
          reactions: t.analytics.reactions,
          whatsappClicks: t.analytics.whatsappClicks,
          ratingIndex: t.analytics.ratingIndex,
        }}
      />
    </div>
  );
}
