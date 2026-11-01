import { DiaryBoard } from "@/components/desktop/calendar/DiaryBoard";
import { demoGaps } from "@/lib/demo/store";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/locale";

export default async function CalendarPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  const busyStart = new Date();
  busyStart.setHours(9, 0, 0, 0);
  const busyEnd = new Date(busyStart);
  busyEnd.setHours(11, 0, 0, 0);

  const postAt = new Date();
  postAt.setDate(postAt.getDate() + 1);
  postAt.setHours(10, 0, 0, 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">{t.nav.calendar}</h1>
      <p className="text-sm text-slate-500">
        {locale === "he"
          ? "סנכרון Google + Apple · תפוס אפור · פוסטים בכחול שמיים"
          : "Google + Apple sync · Busy gray · Publications sky-blue"}
      </p>
      <DiaryBoard
        locale={locale}
        gaps={demoGaps}
        fillLabel={t.post.fillSlot}
        busyBlocks={[
          {
            id: "busy_1",
            title:
              locale === "he"
                ? "תיקון דוד — לקוח קבוע"
                : "Boiler repair — returning client",
            startsAt: busyStart.toISOString(),
            endsAt: busyEnd.toISOString(),
          },
        ]}
        scheduledPosts={[
          {
            id: "post_pin_1",
            platform: "instagram",
            title:
              locale === "he"
                ? "פוסט מתוזמן: לפני/אחרי"
                : "Scheduled post: before/after",
            startsAt: postAt.toISOString(),
          },
        ]}
      />
    </div>
  );
}
