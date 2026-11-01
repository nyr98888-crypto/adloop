"use client";

import { useMemo } from "react";
import type { Locale } from "@/lib/domain/types";
import { useBusiness } from "@/context/BusinessContext";
import { isolateLtr } from "@/lib/i18n/bidi";
import {
  buildDemoAppointments,
  defaultReviewLinks,
  dueForRecall,
  nextUpcoming,
  onMyWayMessage,
  openWhatsApp,
  recallMessage,
  recentlyEnded,
  reviewRequestMessage,
} from "@/lib/ops/appointments";

export function TodaysActions({ locale }: { locale: Locale }) {
  const { profile } = useBusiness();
  const appts = useMemo(() => buildDemoAppointments(locale), [locale]);
  const next = nextUpcoming(appts);
  const postJob = recentlyEnded(appts, 2);
  const recall = dueForRecall(appts, profile.trade);
  const links = defaultReviewLinks(profile.name);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[#0077F6]">
        {locale === "he" ? "פעולות להיום" : "Today's actions"}
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Next appointment */}
        <article className="flex flex-col rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#005AC2]">
            {locale === "he" ? "התור הבא" : "Next appointment"}
          </p>
          {next ? (
            <>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {next.client.name}
              </p>
              <p className="text-sm text-slate-600">{next.service}</p>
              <p className="mt-1 text-xs text-slate-500">
                {isolateLtr(
                  new Date(next.startsAt).toLocaleString(
                    locale === "he" ? "he-IL" : "en-US",
                    { weekday: "short", hour: "2-digit", minute: "2-digit" },
                  ),
                )}
              </p>
              <button
                type="button"
                onClick={() =>
                  openWhatsApp(
                    next.client.phone,
                    onMyWayMessage(locale, profile.name, next.client.name),
                  )
                }
                className="mt-auto pt-4 inline-flex rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white"
              >
                {locale === "he"
                  ? "בדרך אליך (20 דק')"
                  : "On my way (20 min)"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              {locale === "he" ? "אין תורים קרובים" : "No upcoming appointments"}
            </p>
          )}
        </article>

        {/* Post-job review */}
        <article className="flex flex-col rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            {locale === "he" ? "בקשת המלצה" : "Review prompt"}
          </p>
          {postJob ? (
            <>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {postJob.client.name}
              </p>
              <p className="text-sm text-slate-600">{postJob.service}</p>
              <p className="mt-1 text-xs text-slate-500">
                {locale === "he"
                  ? "הסתיים ב־2 השעות האחרונות"
                  : "Ended within the last 2 hours"}
              </p>
              <button
                type="button"
                onClick={() =>
                  openWhatsApp(
                    postJob.client.phone,
                    reviewRequestMessage(
                      locale,
                      profile.name,
                      postJob.client.name,
                      links.google,
                      links.easy,
                    ),
                  )
                }
                className="mt-auto pt-4 inline-flex rounded-xl bg-[#0077F6] px-3 py-2.5 text-sm font-semibold text-white"
              >
                {locale === "he"
                  ? "בקש המלצה בוואטסאפ"
                  : "Request review on WhatsApp"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              {locale === "he"
                ? "אין עבודות שהסתיימו לאחרונה"
                : "No recently completed jobs"}
            </p>
          )}
        </article>

        {/* Recall engine */}
        <article className="flex flex-col rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#005AC2]">
            {locale === "he" ? "מנוע חזרות" : "Recall engine"}
          </p>
          {recall ? (
            <>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {recall.client.name}
              </p>
              <p className="text-sm text-slate-600">{recall.service}</p>
              <p className="mt-1 text-xs text-slate-500">
                {locale === "he"
                  ? "מועד לתחזוקה חוזרת לפי תדירות הענף"
                  : "Due for recurring maintenance by trade cadence"}
              </p>
              <button
                type="button"
                onClick={() =>
                  openWhatsApp(
                    recall.client.phone,
                    recallMessage(
                      locale,
                      profile.name,
                      recall.client.name,
                      recall.service,
                      profile.phone,
                    ),
                  )
                }
                className="mt-auto pt-4 inline-flex rounded-xl border-2 border-[#4DACFF] bg-white px-3 py-2.5 text-sm font-semibold text-[#0077F6]"
              >
                {locale === "he"
                  ? "שלח תזכורת תיאום תור"
                  : "Send booking reminder"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              {locale === "he"
                ? "אין לקוחות לתזכורת כרגע"
                : "No clients due for recall"}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
