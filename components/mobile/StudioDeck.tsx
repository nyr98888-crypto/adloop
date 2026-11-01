"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostPayload } from "@/lib/domain/types";
import { PLATFORM_LABELS } from "@/lib/domain/types";

export function StudioDeck({ locale }: { locale: "he" | "en" }) {
  const [post, setPost] = useState<PostPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("ols_post");
    if (raw) setPost(JSON.parse(raw) as PostPayload);
  }, []);

  if (!post) {
    return (
      <div className="rounded-xl bg-brand-surface p-6 text-sm text-brand-accent/70">
        {locale === "he" ? "אין טיוטת פוסט עדיין." : "No post draft yet."}{" "}
        <Link href="/m" className="text-brand-sky underline">
          {locale === "he" ? "חזרה לצילום" : "Back to capture"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {post.whatsappCard && (
        <article className="rounded-2xl border border-brand-ok/30 bg-brand-surface p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-brand-ok">
            WhatsApp
          </h2>
          <p className="mb-2 font-medium">{post.whatsappCard.emphasis}</p>
          <ul className="mb-3 list-disc ps-5 text-sm">
            {post.whatsappCard.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="text-sm font-semibold text-brand-primary">
            {post.whatsappCard.contactCta}
          </p>
        </article>
      )}

      {post.variants
        .filter((v) => v.platform !== "whatsapp")
        .map((v) => (
          <article
            key={v.connectedAccountId}
            className="rounded-2xl border border-brand-sky/20 bg-brand-surface p-4 shadow-sm"
          >
            <h2 className="mb-2 text-sm font-semibold text-brand-primary">
              {PLATFORM_LABELS[v.platform][locale]}
            </h2>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {v.caption}
            </pre>
            {v.hashtags?.length ? (
              <p className="mt-2 text-xs text-brand-sky">
                {v.hashtags.join(" ")}
              </p>
            ) : null}
          </article>
        ))}

      {post.strippedClaims && post.strippedClaims.length > 0 && (
        <p className="text-xs text-brand-warn">
          {locale === "he"
            ? "הוסרו טענות לא מבוססות אוטומטית."
            : "Ungrounded claims were stripped automatically."}
        </p>
      )}

      <Link
        href="/m/publish"
        className="rounded-xl bg-brand-primary px-4 py-3.5 text-center text-base font-semibold text-white"
      >
        {locale === "he" ? "המשך לפרסום" : "Continue to publish"}
      </Link>
    </div>
  );
}
