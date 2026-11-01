import type { DiaryGap, Locale } from "@/lib/domain/types";
import { isolateLtr } from "@/lib/i18n/bidi";

export function SocialWorkerBanner({
  locale,
  businessName,
  nextGap,
  daysSinceLastPost,
}: {
  locale: Locale;
  businessName: string;
  nextGap?: DiaryGap;
  daysSinceLastPost: number;
}) {
  const firstName = isolateLtr(businessName.split(/\s+/)[0] ?? businessName);
  const days = isolateLtr(daysSinceLastPost);
  const weekday = nextGap
    ? isolateLtr(
        new Date(nextGap.windowStart).toLocaleDateString(
          locale === "he" ? "he-IL" : "en-US",
          { weekday: "long" },
        ),
      )
    : null;

  const gapHint = nextGap
    ? locale === "he"
      ? `יש לכם חלון פנוי ב־${weekday}`
      : `you have an open slot on ${weekday}`
    : locale === "he"
      ? "היומן נראה מלא השבוע"
      : "the diary looks full this week";

  const message =
    locale === "he"
      ? `שלום ${firstName}, ${gapHint}, ולא פרסמנו כבר ${days} ימים. בואו נקליט עדכון עבודה של ${isolateLtr(20)} שניות.`
      : `Hi ${firstName}, ${gapHint}, and we haven't posted in ${days} days. Let's record a ${isolateLtr(20)}-second job update.`;

  return (
    <section
      className="rounded-2xl p-5 text-white shadow-sm"
      style={{
        backgroundImage: "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#BAE6FD]">
        Social Worker
      </p>
      <p className="mt-2 text-lg font-semibold leading-relaxed">{message}</p>
    </section>
  );
}
