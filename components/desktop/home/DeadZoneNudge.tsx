"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DiaryGap, Locale } from "@/lib/domain/types";
import { useSocialWorker } from "@/hooks/useSocialWorker";
import type { NudgeResult } from "@/lib/ai/agent/schemas";

export function DeadZoneNudge({
  locale,
  nextGap,
  daysSinceLastPost,
}: {
  locale: Locale;
  nextGap?: DiaryGap;
  daysSinceLastPost: number;
}) {
  const { getProactiveNudge } = useSocialWorker(locale);
  const [nudge, setNudge] = useState<NudgeResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getProactiveNudge(daysSinceLastPost, nextGap ?? null);
      if (cancelled || !result?.data) return;
      setNudge(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [getProactiveNudge, nextGap, daysSinceLastPost]);

  const href = (() => {
    if (!nextGap) {
      return `/d/dashboard?seedPrompt=${encodeURIComponent(nudge?.seedPrompt ?? "")}`;
    }
    return `/d/dashboard?gapId=${encodeURIComponent(nextGap.id)}&windowStart=${encodeURIComponent(nextGap.windowStart)}&windowEnd=${encodeURIComponent(nextGap.windowEnd)}&seedPrompt=${encodeURIComponent(nudge?.seedPrompt ?? "")}`;
  })();

  const urgencyRing =
    nudge?.urgency === "high"
      ? "ring-2 ring-amber-300"
      : nudge?.urgency === "medium"
        ? "ring-1 ring-[#BAE6FD]"
        : "";

  return (
    <section
      className={`rounded-2xl p-5 text-white shadow-sm ${urgencyRing}`}
      style={{
        backgroundImage: "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#BAE6FD]">
        Social Worker · {locale === "he" ? "אזור מת" : "Dead zone"}
      </p>
      <p className="mt-2 text-lg font-semibold leading-relaxed">
        {nudge?.headline ??
          (locale === "he"
            ? "טוען המלצת פרסום…"
            : "Loading publishing nudge…")}
      </p>
      {nudge && (
        <Link
          href={href}
          className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0077F6]"
        >
          {nudge.cta}
        </Link>
      )}
    </section>
  );
}
