"use client";

import { useMemo, useState } from "react";
import type {
  ContentFormatFilter,
  EngagementPulse,
  Locale,
  NetworkEngagement,
  Platform,
} from "@/lib/domain/types";
import { PLATFORM_LABELS } from "@/lib/domain/types";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import type { SocialPlatformId } from "@/types/social";
import { useBusiness } from "@/context/BusinessContext";
import { demoMetricsForPlatform } from "@/lib/analytics/demo-metrics";
import {
  PlatformDetailModal,
  buildInsight,
  type PlatformInsight,
} from "@/components/desktop/analytics/PlatformDetailModal";

const VIDEO_PLATFORMS = new Set<Platform>(["tiktok", "youtube", "instagram"]);

function matchesFilter(row: NetworkEngagement, filter: ContentFormatFilter) {
  if (filter === "all") return true;
  if (filter === "video") {
    return (
      VIDEO_PLATFORMS.has(row.platform) ||
      row.contentKind === "video" ||
      row.contentKind === "mixed" ||
      (row.videoPlays ?? 0) > 0
    );
  }
  // Standard feed posts — include Instagram feed alongside FB/LinkedIn/WA etc.
  return (
    row.platform !== "tiktok" &&
    row.platform !== "youtube"
  );
}

export function PulseCards({
  pulse,
  locale,
  labels,
}: {
  pulse: EngagementPulse;
  locale: Locale;
  labels: {
    topPost: string;
    reactions: string;
    whatsappClicks: string;
    ratingIndex: string;
  };
}) {
  const { enabledAccounts, accounts } = useBusiness();
  const [insight, setInsight] = useState<PlatformInsight | null>(null);
  const [filter, setFilter] = useState<ContentFormatFilter>("all");

  // Live sync: every currently enabled channel → one metrics row (no static list)
  const rows = useMemo(() => {
    const byPlatform = new Map(
      pulse.perNetworkReactions.map((r) => [r.platform, r] as const),
    );
    const enabled = enabledAccounts.length
      ? enabledAccounts
      : accounts.filter((a) => a.enabled);

    return enabled
      .map((a) => {
        const fromPulse = byPlatform.get(a.platform);
        return fromPulse ?? demoMetricsForPlatform(a.platform);
      })
      .filter((row) => matchesFilter(row, filter));
  }, [pulse.perNetworkReactions, enabledAccounts, accounts, filter]);

  function openRow(row: NetworkEngagement) {
    setInsight(buildInsight(row, locale));
  }

  const segments: { id: ContentFormatFilter; he: string; en: string }[] = [
    { id: "all", he: "הכל", en: "All content" },
    { id: "video", he: "סרטונים ו-Reels", en: "Videos & Reels" },
    { id: "feed", he: "פוסטים ותמונות", en: "Feed posts" },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex flex-wrap rounded-full bg-[#005AC2]/10 p-1"
          role="tablist"
          aria-label={locale === "he" ? "סוג תוכן" : "Content type"}
        >
          {segments.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={filter === s.id}
              onClick={() => setFilter(s.id)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                filter === s.id
                  ? "bg-white font-semibold text-[#0077F6] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {locale === "he" ? s.he : s.en}
            </button>
          ))}
        </div>
        <p className="text-xs font-medium text-[#005AC2]">
          {locale === "he"
            ? `${enabledAccounts.length} רשתות פעילות`
            : `${enabledAccounts.length} active networks`}
        </p>
      </div>

      <div className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#0077F6]">
          {labels.topPost}
        </h2>
        {pulse.topPostOfWeek ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DACFF] to-[#005AC2] text-white sm:w-36">
              <PlatformLogo
                platform={pulse.topPostOfWeek.platform as SocialPlatformId}
                className="h-10 w-10 text-white"
              />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-900">
                {pulse.topPostOfWeek.captionSnippet}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {PLATFORM_LABELS[pulse.topPostOfWeek.platform][locale]} · reach{" "}
                {pulse.topPostOfWeek.reach.toLocaleString()} · score{" "}
                {pulse.topPostOfWeek.score}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">—</p>
        )}
      </div>

      <div className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#0077F6]">
          {filter === "video"
            ? locale === "he"
              ? "מדדי וידאו לפי רשת"
              : "Video metrics by network"
            : labels.reactions}
        </h2>
        {!rows.length ? (
          <p className="text-sm text-slate-500">
            {locale === "he"
              ? "אין רשתות פעילות — הפעילו בהגדרות."
              : "No active networks — enable in Settings."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-start text-sm">
              <thead>
                <tr className="border-b border-[#BAE6FD] text-slate-500">
                  <th className="py-2 pe-3 font-medium">
                    {locale === "he" ? "רשת" : "Network"}
                  </th>
                  {filter === "video" ? (
                    <>
                      <th className="py-2 pe-3 font-medium">
                        {locale === "he" ? "צפיות" : "Plays"}
                      </th>
                      <th className="py-2 pe-3 font-medium">
                        {locale === "he" ? "זמן צפייה" : "Watch time"}
                      </th>
                      <th className="py-2 font-medium">
                        {locale === "he" ? "שיתופי וידאו" : "Video shares"}
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="py-2 pe-3 font-medium">
                        {locale === "he" ? "לייקים" : "Likes"}
                      </th>
                      <th className="py-2 pe-3 font-medium">
                        {locale === "he" ? "תגובות" : "Comments"}
                      </th>
                      <th className="py-2 pe-3 font-medium">
                        {locale === "he" ? "שיתופים" : "Shares"}
                      </th>
                      <th className="py-2 font-medium">
                        {locale === "he" ? "אחר" : "Other"}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((n) => (
                  <tr
                    key={n.platform}
                    onClick={() => openRow(n)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-[#BAE6FD]/35"
                  >
                    <td className="py-2.5 pe-3">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <PlatformLogo
                          platform={n.platform as SocialPlatformId}
                          className="h-4 w-4"
                        />
                        {PLATFORM_LABELS[n.platform][locale]}
                      </span>
                    </td>
                    {filter === "video" ? (
                      <>
                        <td className="py-2.5 pe-3">
                          {(n.videoPlays ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 pe-3">
                          {n.watchTimeSec
                            ? `${Math.round(n.watchTimeSec / 60)}m`
                            : "—"}
                        </td>
                        <td className="py-2.5">{n.videoShares ?? n.shares}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 pe-3">{n.likes}</td>
                        <td className="py-2.5 pe-3">{n.comments}</td>
                        <td className="py-2.5 pe-3">{n.shares}</td>
                        <td className="py-2.5 text-slate-600">
                          {n.whatsappLinkClicks != null
                            ? `${locale === "he" ? "WA" : "WA"}: ${n.whatsappLinkClicks}`
                            : n.reviewsCount != null
                              ? `${locale === "he" ? "ביקורות" : "Reviews"}: ${n.reviewsCount}`
                              : n.videoPlays != null
                                ? `${locale === "he" ? "צפיות" : "Plays"}: ${n.videoPlays.toLocaleString()}`
                                : "—"}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-[#0077F6]">
            {labels.whatsappClicks}
          </h2>
          <p className="text-3xl font-bold text-[#0077F6]">
            {pulse.whatsappDirectLinkClicks}
          </p>
        </div>
        <div className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-[#0077F6]">
            {labels.ratingIndex}
          </h2>
          <p className="text-3xl font-bold text-brand-ok">
            {pulse.unifiedRatingIndex.combined ?? "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Google {pulse.unifiedRatingIndex.googleAvg ?? "—"} · Easy{" "}
            {pulse.unifiedRatingIndex.easyAvg ?? "—"}
          </p>
        </div>
      </div>

      {insight && (
        <PlatformDetailModal
          locale={locale}
          insight={insight}
          onClose={() => setInsight(null)}
        />
      )}
    </div>
  );
}
