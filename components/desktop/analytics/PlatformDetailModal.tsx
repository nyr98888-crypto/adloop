"use client";

import Link from "next/link";
import type { Locale, NetworkEngagement, Platform } from "@/lib/domain/types";
import { PLATFORM_LABELS } from "@/lib/domain/types";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import type { SocialPlatformId } from "@/types/social";

export type PlatformInsight = {
  platform: Platform;
  winning: {
    caption: string;
    reach: number;
    reactions: number;
    waClicks: number;
  };
  underperforming: {
    caption: string;
    takeawayHe: string;
    takeawayEn: string;
  };
  formulaPrompt: string;
};

export function buildInsight(
  row: NetworkEngagement,
  locale: Locale,
): PlatformInsight {
  const name = PLATFORM_LABELS[row.platform][locale];
  return {
    platform: row.platform,
    winning: {
      caption:
        locale === "he"
          ? `פוסט מוביל ב${name}: לפני/אחרי עבודה בשטח + קריאה לפעולה`
          : `Top ${name} post: before/after job photo + clear CTA`,
      reach: Math.max(120, (row.likes + row.comments) * 8),
      reactions: row.likes + row.comments + row.shares,
      waClicks: row.whatsappLinkClicks ?? Math.round(row.likes * 0.15),
    },
    underperforming: {
      caption:
        locale === "he"
          ? `פוסט טקסט בלבד ב${name} ללא תמונת עבודה`
          : `Text-only ${name} post without job photo`,
      takeawayHe:
        "פוסטים ללא תמונת עבודה הניבו 65% פחות פניות בוואטסאפ",
      takeawayEn:
        "Posts without a job photo drove 65% fewer WhatsApp inquiries",
    },
    formulaPrompt:
      locale === "he"
        ? `שכפל את נוסחת הפוסט המוביל מ${name}: תמונת לפני/אחרי, משפט קצר על השירות שביצענו, וקישור ישיר לוואטסאפ.`
        : `Reuse the winning ${name} post formula: before/after photo, short service line, and a direct WhatsApp link.`,
  };
}

/**
 * Fixed overlay slide-over — does not compress the metrics table.
 */
export function PlatformDetailModal({
  locale,
  insight,
  onClose,
}: {
  locale: Locale;
  insight: PlatformInsight;
  onClose: () => void;
}) {
  const studioHref = `/d/dashboard?formula=${encodeURIComponent(insight.formulaPrompt)}`;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close backdrop"
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className="absolute inset-y-0 end-0 z-[101] flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-s border-white/20 bg-white/95 p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <PlatformLogo
              platform={insight.platform as SocialPlatformId}
              className="h-6 w-6"
            />
            {PLATFORM_LABELS[insight.platform][locale]}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <article className="rounded-2xl border border-[#BAE6FD] p-4">
          <h3 className="text-sm font-semibold text-[#0077F6]">
            {locale === "he" ? "הפוסט המוביל" : "Winning post"}
          </h3>
          <div className="mt-3 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DACFF] to-[#005AC2] text-white">
            <PlatformLogo
              platform={insight.platform as SocialPlatformId}
              className="h-10 w-10 text-white"
            />
          </div>
          <p className="mt-3 text-sm text-slate-800">{insight.winning.caption}</p>
          <p className="mt-2 text-xs text-slate-500">
            reach {insight.winning.reach} · reactions{" "}
            {insight.winning.reactions} · WA clicks {insight.winning.waClicks}
          </p>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <h3 className="text-sm font-semibold text-amber-700">
            {locale === "he" ? "טעון שיפור" : "Needs improvement"}
          </h3>
          <p className="mt-2 text-sm text-slate-800">
            {insight.underperforming.caption}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {locale === "he"
              ? insight.underperforming.takeawayHe
              : insight.underperforming.takeawayEn}
          </p>
        </article>

        <Link
          href={studioHref}
          onClick={onClose}
          className="rounded-xl px-4 py-3 text-center text-sm font-bold text-white"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
          }}
        >
          {locale === "he"
            ? "שכפל נוסחה זו לסטודיו"
            : "Reuse this formula in Studio"}
        </Link>
      </aside>
    </div>
  );
}
