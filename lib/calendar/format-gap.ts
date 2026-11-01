import type { DiaryGap, Locale } from "@/lib/domain/types";
import { isolateLtr } from "@/lib/i18n/bidi";

export function formatOpenGapLabel(gap: DiaryGap, locale: Locale): string {
  const start = new Date(gap.windowStart);
  const end = new Date(gap.windowEnd);
  const hours = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (60 * 60 * 1000)),
  );

  if (locale === "he") {
    const day = start.toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const range = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}–${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
    return `${day} | ${isolateLtr(range)} (חלון פנוי של ${isolateLtr(hours)} שעות)`;
  }

  const day = start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const range = `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
  return `${day} | ${isolateLtr(range)} (${isolateLtr(hours)}h open slot)`;
}

export function buildAvailabilitySeedPrompt(
  gap: DiaryGap,
  locale: Locale,
): string {
  const start = new Date(gap.windowStart);
  const end = new Date(gap.windowEnd);
  const timeRange = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}-${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  const dayName = start.toLocaleDateString(
    locale === "he" ? "he-IL" : "en-US",
    { weekday: "long" },
  );

  if (locale === "he") {
    return `פרסם הודעה על פתיחת חלון קבלת קהל / שירות ביום ${dayName} הקרוב בין השעות ${timeRange} באזור השירות שלך.`;
  }
  return `Publish a notice about an open service window this coming ${dayName} between ${timeRange} in your service area.`;
}
