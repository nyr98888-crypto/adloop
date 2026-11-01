"use client";

import Link from "next/link";
import type { Locale } from "@/lib/domain/types";
import type { DiaryGap, ReviewFeedItem } from "@/lib/domain/types";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import type { SocialPlatformId } from "@/types/social";
import { SOCIAL_NETWORKS } from "@/types/social";
import { useBusiness } from "@/context/BusinessContext";
import { isolateLtr } from "@/lib/i18n/bidi";
import {
  buildAvailabilitySeedPrompt,
  formatOpenGapLabel,
} from "@/lib/calendar/format-gap";
import type { RecentPublication } from "@/lib/demo/store";
import { DeadZoneNudge } from "@/components/desktop/home/DeadZoneNudge";
import { TodaysActions } from "@/components/desktop/home/TodaysActions";

const WEEKLY_GOAL = 3;

export function HomeCockpit({
  locale,
  gaps,
  unansweredReviews,
  daysSinceLastPost,
  postsThisWeek,
  recentPublications,
}: {
  locale: Locale;
  gaps: DiaryGap[];
  unansweredReviews: ReviewFeedItem[];
  daysSinceLastPost: number;
  postsThisWeek: number;
  recentPublications: RecentPublication[];
}) {
  const { profile, enabledAccounts } = useBusiness();
  const totalNetworks = SOCIAL_NETWORKS.length;
  const activeCount = enabledAccounts.length;
  const nextGap = gaps.find((g) => g.status === "open");
  const weeklyDone = Math.min(postsThisWeek, WEEKLY_GOAL);
  const weeklyPct = Math.round((weeklyDone / WEEKLY_GOAL) * 100);

  const gapHref = (() => {
    if (!nextGap) return "/d/dashboard";
    const start = new Date(nextGap.windowStart);
    const end = new Date(nextGap.windowEnd);
    const slotDate = start.toISOString().slice(0, 10);
    const slotTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}-${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
    const seed = buildAvailabilitySeedPrompt(nextGap, locale);
    return `/d/dashboard?gapId=${encodeURIComponent(nextGap.id)}&windowStart=${encodeURIComponent(nextGap.windowStart)}&windowEnd=${encodeURIComponent(nextGap.windowEnd)}&slotDate=${encodeURIComponent(slotDate)}&slotTime=${encodeURIComponent(slotTime)}&seedPrompt=${encodeURIComponent(seed)}`;
  })();

  const firstName = isolateLtr(profile.name.split(/\s+/)[0] ?? profile.name);

  return (
    <div className="flex flex-col gap-6">
      {/* Pipeline A — Dead-zone nudge via /api/agent */}
      <DeadZoneNudge
        locale={locale}
        nextGap={nextGap}
        daysSinceLastPost={daysSinceLastPost}
      />

      <TodaysActions locale={locale} />

      {/* 1. Greeting + active business badge */}
      <header className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          {locale === "he" ? "שלום" : "Hello"}, {firstName}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
          <span className="rounded-full bg-[#005AC2]/10 px-3 py-1 text-xs font-semibold text-[#005AC2]">
            {profile.trade}
          </span>
          <span className="rounded-full bg-[#0077F6] px-3 py-1 text-xs font-semibold text-white">
            {isolateLtr(`${activeCount}/${totalNetworks}`)}{" "}
            {locale === "he" ? "פעילים" : "active"}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {locale === "he"
            ? `לא פרסמנו כבר ${isolateLtr(daysSinceLastPost)} ימים — הנה סדר היום.`
            : `No posts in ${isolateLtr(daysSinceLastPost)} days — here's today's deck.`}
        </p>
      </header>

      {/* 2. Social Worker priority deck */}
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0077F6]">
            {locale === "he" ? "ביקורות ממתינות" : "Unanswered reviews"}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {unansweredReviews.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Google · Easy
            {unansweredReviews[0]
              ? ` · ${unansweredReviews[0].authorName ?? ""}`
              : ""}
          </p>
          <Link
            href="/d/reviews"
            className="mt-4 inline-flex rounded-xl bg-[#0077F6] px-4 py-2 text-sm font-semibold text-white"
          >
            {locale === "he" ? "ענה עכשיו" : "Reply now"}
          </Link>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0077F6]">
              {locale === "he" ? "הזדמנות ביומן" : "Calendar gap"}
            </p>
            <StatusBadge tone="warn">
              {locale === "he" ? "פעולה" : "Action"}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-800">
            {nextGap
              ? formatOpenGapLabel(nextGap, locale)
              : locale === "he"
                ? "אין חלונות פתוחים"
                : "No open gaps"}
          </p>
          {nextGap && (
            <Link
              href={gapHref}
              className="mt-4 inline-flex rounded-xl bg-[#0077F6] px-4 py-2 text-sm font-semibold text-white"
            >
              {locale === "he" ? "מלא חלון זה בפוסט" : "Fill this slot with a post"}
            </Link>
          )}
        </article>

        <article className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0077F6]">
            {locale === "he" ? "התקדמות שבועית" : "Weekly publishing"}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {isolateLtr(`${weeklyDone}/${WEEKLY_GOAL}`)}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#BAE6FD]/60">
            <div
              className="h-full rounded-full bg-[#0077F6] transition-all"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {locale === "he"
              ? "פוסטים שפורסמו השבוע"
              : "Posts published this week"}
          </p>
        </article>
      </section>

      {/* 3. Recent publications carousel */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#0077F6]">
          {locale === "he" ? "פיד פרסומים אחרונים" : "Recent publications"}
        </h2>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {recentPublications.map((pub) => (
            <article
              key={pub.id}
              className="w-56 shrink-0 rounded-2xl border border-[#BAE6FD] bg-white p-3 shadow-sm"
            >
              <div
                className="flex h-28 items-center justify-center rounded-xl text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #4DACFF 0%, #005AC2 100%)",
                }}
              >
                <PlatformLogo
                  platform={pub.platform as SocialPlatformId}
                  className="h-10 w-10 text-white"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-900">
                {pub.title}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <StatusBadge
                  tone={pub.status === "published" ? "ok" : "warn"}
                >
                  {pub.status === "published"
                    ? locale === "he"
                      ? "פורסם"
                      : "Published"
                    : locale === "he"
                      ? "מתוזמן"
                      : "Scheduled"}
                </StatusBadge>
                <span>
                  {locale === "he" ? "תגובות" : "rx"} {isolateLtr(pub.reactions)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Quick actions */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/d/dashboard"
          className="rounded-2xl px-5 py-4 text-center text-base font-bold text-white shadow-sm"
          style={{
            backgroundImage:
              "linear-gradient(to left, #0284FE 0%, #005AC2 100%)",
          }}
        >
          {locale === "he" ? "הקלטה קולית מהירה" : "Quick voice post"}
        </Link>
        <Link
          href="/d/dashboard?media=1"
          className="rounded-2xl border-2 border-[#4DACFF] bg-white px-5 py-4 text-center text-base font-bold text-[#0077F6]"
        >
          {locale === "he" ? "העלאת מדיה" : "Upload media"}
        </Link>
      </section>
    </div>
  );
}
