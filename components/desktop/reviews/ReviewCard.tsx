"use client";

import { useState } from "react";
import type {
  Locale,
  ReviewFeedItem,
  ReviewReplyPreset,
} from "@/lib/domain/types";
import { useSocialWorker } from "@/hooks/useSocialWorker";

const PRESETS: Array<{
  id: ReviewReplyPreset;
  he: string;
  en: string;
}> = [
  {
    id: "warm_grateful",
    he: "תגובה חמה ומודה",
    en: "Warm & Grateful",
  },
  {
    id: "professional_concise",
    he: "תגובה עניינית ומקצועית",
    en: "Professional & Concise",
  },
  {
    id: "deescalating_compromise",
    he: "תגובה מרגיעה ומגשרת",
    en: "De-escalating & Compromising",
  },
];

export function ReviewCard({
  review,
  locale,
}: {
  review: ReviewFeedItem;
  locale: Locale;
}) {
  const { generateReviewReplies, loading, error } = useSocialWorker(locale);
  const [draft, setDraft] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  async function generate(preset: ReviewReplyPreset) {
    const result = await generateReviewReplies(
      {
        id: review.id,
        source: review.source,
        rating: review.rating,
        text: review.text,
        authorName: review.authorName,
        externalId: review.externalId,
        createdAt: review.createdAt,
        provenance: review.provenance,
      },
      preset,
    );
    if (!result) return;
    setDraft(result.draft?.text ?? result.data?.[preset] ?? null);
    setSource(result.source ?? null);
  }

  return (
    <article className="rounded-2xl bg-brand-surface p-5 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold uppercase text-brand-sky">
          {review.source}
        </span>
        <span className="text-brand-warn">{"★".repeat(review.rating)}</span>
        <span className="text-xs text-brand-accent/50">
          {review.provenance.method}
        </span>
        {source && (
          <span className="text-[10px] text-slate-400">
            agent · {source}
          </span>
        )}
      </div>
      <p className="mb-1 text-sm font-medium">{review.authorName}</p>
      <p className="mb-4 text-sm leading-relaxed">{review.text}</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={loading}
            onClick={() => generate(p.id)}
            className="rounded-lg border border-brand-sky/30 px-3 py-1.5 text-xs font-medium text-brand-primary disabled:opacity-50"
          >
            {locale === "he" ? p.he : p.en}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-amber-700">{error}</p>
      )}
      {draft && (
        <textarea
          className="mt-4 w-full rounded-xl border border-brand-sky/20 p-3 text-sm"
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}
    </article>
  );
}
