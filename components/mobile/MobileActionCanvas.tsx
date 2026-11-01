"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale, PostPayload } from "@/lib/domain/types";
import { PLATFORM_LABELS } from "@/lib/domain/types";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import type { SocialPlatformId } from "@/types/social";
import {
  buildRawFallbackPost,
  fetchAiWithTimeout,
} from "@/lib/ai/fetch-with-timeout";
import { demoAccounts } from "@/lib/demo/store";

export function MobileActionCanvas({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { voice: string; photo: string; generate: string; copyAndOpen: string };
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [post, setPost] = useState<PostPayload | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function startVoice() {
    const SR =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setText(
        locale === "he"
          ? "תיקנתי נזילה בכיור ברעננה היום"
          : "Fixed a sink leak in Ra'anana today",
      );
      return;
    }
    const rec = new SR();
    rec.lang = locale === "he" ? "he-IL" : "en-US";
    setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      setText(e.results?.[0]?.[0]?.transcript ?? "");
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  async function generate() {
    setBusy(true);
    setNote(null);
    const result = await fetchAiWithTimeout("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "studio_generate",
        locale,
        userInput: text,
      }),
    });
    setBusy(false);
    if (!result.ok || !(result.data as { success?: boolean })?.success) {
      const fb = buildRawFallbackPost({ promptText: text, locale });
      setNote(fb.message);
      return;
    }
    const data = result.data as { post?: PostPayload };
    if (data.post) {
      setPost(data.post);
      sessionStorage.setItem("ols_post", JSON.stringify(data.post));
      sessionStorage.setItem("ols_post_id", data.post.id);
    }
  }

  async function copyOpen(platform: string, caption: string) {
    const acc = demoAccounts.find((a) => a.platform === platform);
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      /* ignore */
    }
    if (acc?.deepLinkTemplate) {
      window.location.href = acc.deepLinkTemplate.replace(
        "{text}",
        encodeURIComponent(caption),
      );
    } else if (acc?.webComposerUrl) {
      window.open(acc.webComposerUrl, "_blank");
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={startVoice}
          className="rounded-2xl px-4 py-5 text-base font-bold text-white shadow-sm"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
          }}
        >
          {listening ? "…" : labels.voice}
        </button>
        <label className="cursor-pointer rounded-2xl border-2 border-[#4DACFF] bg-white px-4 py-5 text-center text-base font-bold text-[#0077F6] shadow-sm">
          {labels.photo}
          <input type="file" accept="image/*,video/*" capture="environment" className="hidden" />
        </label>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-[#BAE6FD] bg-white p-4 text-base outline-none"
        placeholder={
          locale === "he" ? "או הקלידו כאן…" : "Or type here…"
        }
      />

      <button
        type="button"
        disabled={busy || !text.trim()}
        onClick={generate}
        className="rounded-2xl bg-[#0077F6] px-4 py-4 text-base font-bold text-white disabled:opacity-50"
      >
        {busy ? "…" : labels.generate}
      </button>
      {note && <p className="text-sm text-amber-700">{note}</p>}

      {post?.variants.map((v) => (
        <article
          key={v.connectedAccountId}
          className="rounded-2xl border border-[#BAE6FD] bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
            <PlatformLogo
              platform={v.platform as SocialPlatformId}
              className="h-5 w-5"
            />
            {PLATFORM_LABELS[v.platform][locale]}
          </div>
          <pre className="mb-3 whitespace-pre-wrap font-sans text-sm text-slate-800">
            {v.caption}
          </pre>
          <button
            type="button"
            onClick={() => copyOpen(v.platform, v.caption)}
            className="w-full rounded-xl border border-[#4DACFF] px-3 py-2.5 text-sm font-semibold text-[#0077F6]"
          >
            {labels.copyAndOpen}
          </button>
        </article>
      ))}

      {post && (
        <button
          type="button"
          onClick={() => router.push("/m/publish")}
          className="text-sm font-semibold text-[#005AC2] underline"
        >
          {locale === "he" ? "מסך פרסום מלא" : "Full publish screen"}
        </button>
      )}
    </div>
  );
}
