"use client";

import { useState } from "react";
import type { Locale, PostPayload } from "@/lib/domain/types";

export function SocialWorkerPanel({ locale }: { locale: Locale }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [draft, setDraft] = useState<PostPayload | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, locale }),
      });
      const data = await res.json();
      setReply(data.reply);
      setDraft(data.draft ?? null);
      if (data.draft) {
        sessionStorage.setItem("ols_post", JSON.stringify(data.draft));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-sky/20 bg-brand-surface p-5">
      <h2 className="mb-3 text-lg font-semibold text-brand-primary">
        Social Worker
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        {locale === "he"
          ? "יוצר רק טיוטות פוסט מבוססות עובדות מהפרופיל והקלט שלכם."
          : "Creates grounded Post drafts only from your profile and input."}
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="mb-3 w-full rounded-xl border border-brand-sky/20 p-3 text-sm"
        placeholder={
          locale === "he"
            ? "מה לפרסם היום?"
            : "What should we publish today?"
        }
      />
      <button
        type="button"
        disabled={busy || !message.trim()}
        onClick={send}
        className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {locale === "he" ? "בקש טיוטת פוסט" : "Request post draft"}
      </button>
      {reply && <p className="mt-3 text-sm">{reply}</p>}
      {draft && (
        <p className="mt-2 text-xs text-brand-ok">
          {locale === "he"
            ? `טיוטת פוסט ${draft.id} · ${draft.variants.length} ערוצים`
            : `Post draft ${draft.id} · ${draft.variants.length} channels`}
        </p>
      )}
    </div>
  );
}
