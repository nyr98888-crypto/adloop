"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DiaryGap, Locale, Platform } from "@/lib/domain/types";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import type { SocialPlatformId } from "@/types/social";
import {
  buildAvailabilitySeedPrompt,
  formatOpenGapLabel,
} from "@/lib/calendar/format-gap";
import {
  buildDemoAppointments,
  type OpsAppointment,
} from "@/lib/ops/appointments";
import { AppointmentDrawer } from "@/components/desktop/calendar/AppointmentDrawer";

export type CalendarBusyBlock = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

export type ScheduledPostPin = {
  id: string;
  platform: Platform;
  title: string;
  startsAt: string;
};

function toSlotParams(gap: DiaryGap) {
  const start = new Date(gap.windowStart);
  const end = new Date(gap.windowEnd);
  const slotDate = start.toISOString().slice(0, 10);
  const slotTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}-${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  return { slotDate, slotTime };
}

export function DiaryBoard({
  locale,
  gaps,
  busyBlocks,
  scheduledPosts,
  fillLabel,
}: {
  locale: Locale;
  gaps: DiaryGap[];
  busyBlocks: CalendarBusyBlock[];
  scheduledPosts: ScheduledPostPin[];
  fillLabel: string;
}) {
  const appointments = useMemo(
    () => buildDemoAppointments(locale),
    [locale],
  );
  const [selected, setSelected] = useState<OpsAppointment | null>(null);

  // Prefer rich ops appointments; fall back to busyBlocks mapped lightly
  const clickableAppts =
    appointments.length > 0
      ? appointments.filter((a) => a.id !== "appt_recall")
      : [];

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-[#0077F6]">
          {locale === "he" ? "תפוס ביומן" : "Busy appointments"}
        </h2>
        {clickableAppts.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelected(a)}
            className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-start text-slate-700 transition hover:border-[#4DACFF] hover:bg-[#BAE6FD]/25"
          >
            <StatusBadge tone="warn">
              {locale === "he" ? "תפוס" : "Busy"}
            </StatusBadge>
            <p className="mt-1 font-medium">
              {a.client.name} · {a.service}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(a.startsAt).toLocaleString(
                locale === "he" ? "he-IL" : "en-US",
              )}{" "}
              –{" "}
              {new Date(a.endsAt).toLocaleTimeString(
                locale === "he" ? "he-IL" : "en-US",
                { hour: "2-digit", minute: "2-digit" },
              )}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-[#0077F6]">
              {locale === "he" ? "לחצו לפרטים ופתק" : "Tap for details & notes"}
            </p>
          </button>
        ))}
        {!clickableAppts.length &&
          busyBlocks.map((b) => (
            <article
              key={b.id}
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700"
            >
              <StatusBadge tone="warn">
                {locale === "he" ? "תפוס" : "Busy"}
              </StatusBadge>
              <p className="mt-1 font-medium">{b.title}</p>
            </article>
          ))}
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-[#0077F6]">
          {locale === "he" ? "פוסטים מתוזמנים" : "Scheduled publications"}
        </h2>
        {scheduledPosts.map((p) => (
          <article
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-[#4DACFF] px-4 py-3 text-white"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
            }}
          >
            <PlatformLogo
              platform={p.platform as SocialPlatformId}
              className="h-6 w-6 text-white"
            />
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-white/80">
                {new Date(p.startsAt).toLocaleString(
                  locale === "he" ? "he-IL" : "en-US",
                )}
              </p>
            </div>
          </article>
        ))}
        {!scheduledPosts.length && (
          <p className="text-sm text-slate-500">
            {locale === "he" ? "אין פוסטים מתוזמנים." : "No scheduled posts."}
          </p>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-[#0077F6]">
          {locale === "he" ? "חלונות פנויים" : "Open gaps"}
        </h2>
        {gaps.map((gap) => {
          const { slotDate, slotTime } = toSlotParams(gap);
          const seed = buildAvailabilitySeedPrompt(gap, locale);
          const href = `/d/dashboard?gapId=${encodeURIComponent(gap.id)}&windowStart=${encodeURIComponent(gap.windowStart)}&windowEnd=${encodeURIComponent(gap.windowEnd)}&slotDate=${encodeURIComponent(slotDate)}&slotTime=${encodeURIComponent(slotTime)}&seedPrompt=${encodeURIComponent(seed)}`;
          return (
            <article
              key={gap.id}
              className="flex flex-col gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50/40 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <StatusBadge tone="warn">
                  {locale === "he" ? "חלון פנוי" : "Open slot"}
                </StatusBadge>
                <p className="mt-2 font-medium text-slate-900">
                  {formatOpenGapLabel(gap, locale)}
                </p>
              </div>
              <Link
                href={href}
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
                }}
              >
                {locale === "he" ? "מלא חלון זה בפוסט" : fillLabel}
              </Link>
            </article>
          );
        })}
      </section>

      {selected && (
        <AppointmentDrawer
          locale={locale}
          appointment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
