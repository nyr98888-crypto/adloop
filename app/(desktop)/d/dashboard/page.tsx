import { PostStudio } from "@/components/desktop/studio/PostStudio";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/locale";

export default async function DashboardStudioPage({
  searchParams,
}: {
  searchParams: Promise<{
    gapId?: string;
    windowStart?: string;
    windowEnd?: string;
    media?: string;
    slotDate?: string;
    slotTime?: string;
    seedPrompt?: string;
    formula?: string;
  }>;
}) {
  const locale = await resolveLocale();
  const t = getDictionary(locale);
  const params = await searchParams;

  const initialGap =
    params.gapId && params.windowStart && params.windowEnd
      ? {
          gapId: params.gapId,
          windowStart: params.windowStart,
          windowEnd: params.windowEnd,
        }
      : null;

  const slotPrompt =
    params.seedPrompt ||
    params.formula ||
    (params.slotDate && params.slotTime
      ? locale === "he"
        ? `פרסם הודעה על פתיחת חלון קבלת קהל / שירות ביום ${params.slotDate} בין השעות ${params.slotTime} באזור השירות שלך.`
        : `Publish a notice about an open service window on ${params.slotDate} between ${params.slotTime} in your service area.`
      : null);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">{t.nav.dashboard}</h1>
      <PostStudio
        locale={locale}
        initialGap={initialGap}
        preferMedia={params.media === "1"}
        slotPrompt={slotPrompt}
      />
    </div>
  );
}
