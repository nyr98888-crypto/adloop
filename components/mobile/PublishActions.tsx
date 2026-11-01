"use client";

import { useEffect, useState } from "react";
import type { PostPayload } from "@/lib/domain/types";
import { PLATFORM_LABELS } from "@/lib/domain/types";

type Result = {
  connectedAccountId: string;
  status: string;
  mode: string;
  manual?: {
    platform: string;
    clipboardText: string;
    deepLink?: string;
    webComposerUrl?: string;
  };
  remotePostId?: string;
};

export function PublishActions({
  locale,
  labels,
}: {
  locale: "he" | "en";
  labels: { publishAll: string; copyAndOpen: string };
}) {
  const [post, setPost] = useState<PostPayload | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ols_post");
    if (raw) setPost(JSON.parse(raw) as PostPayload);
  }, []);

  async function publishAll() {
    if (!post) return;
    setBusy(true);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, device: "mobile" }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
      if (data.post) {
        sessionStorage.setItem("ols_post", JSON.stringify(data.post));
        setPost(data.post);
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyAndOpen(manual: Result["manual"]) {
    if (!manual) return;
    try {
      await navigator.clipboard.writeText(manual.clipboardText);
    } catch {
      /* ignore */
    }
    if (manual.deepLink) {
      window.location.href = manual.deepLink;
      return;
    }
    if (manual.webComposerUrl) {
      window.open(manual.webComposerUrl, "_blank");
    }
  }

  if (!post) {
    return <p className="text-sm text-brand-accent/70">No post.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        disabled={busy}
        onClick={publishAll}
        className="rounded-xl bg-brand-primary px-4 py-3.5 text-base font-semibold text-white disabled:opacity-50"
      >
        {busy ? "…" : labels.publishAll}
      </button>

      {results.map((r) => (
        <div
          key={r.connectedAccountId}
          className="rounded-xl border border-brand-sky/20 bg-brand-surface p-4"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-medium">
              {r.manual
                ? PLATFORM_LABELS[
                    r.manual.platform as keyof typeof PLATFORM_LABELS
                  ]?.[locale] ?? r.manual.platform
                : r.connectedAccountId}
            </span>
            <span className="text-xs text-brand-accent/60">
              {r.status} · {r.mode}
            </span>
          </div>
          {r.status === "awaiting_manual" && r.manual && (
            <button
              type="button"
              onClick={() => copyAndOpen(r.manual)}
              className="w-full rounded-lg bg-brand-sky px-3 py-2 text-sm font-medium text-white"
            >
              {labels.copyAndOpen}
            </button>
          )}
          {r.remotePostId && (
            <p className="text-xs text-brand-ok">ID: {r.remotePostId}</p>
          )}
        </div>
      ))}
    </div>
  );
}
