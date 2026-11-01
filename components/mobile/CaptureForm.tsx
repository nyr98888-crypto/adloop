"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/domain/types";

export function CaptureForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { voice: string; photo: string; generate: string };
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);

  function startVoice() {
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setText((t) =>
        t ||
        (locale === "he"
          ? "תיקנתי נזילה בכיור ברעננה היום"
          : "Fixed a sink leak in Ra'anana today"),
      );
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = locale === "he" ? "he-IL" : "en-US";
    setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setText(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: text,
          transcription: text,
          locale,
        }),
      });
      const data = await res.json();
      if (data.post?.id) {
        sessionStorage.setItem("ols_post_id", data.post.id);
        sessionStorage.setItem("ols_post", JSON.stringify(data.post));
        router.push("/m/studio");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full rounded-xl border border-brand-sky/20 bg-brand-surface p-4 text-base outline-none ring-brand-sky focus:ring-2"
        placeholder={
          locale === "he"
            ? "ספרו מה עשיתם היום… או הכתבה קולית"
            : "What did you do today… or use voice"
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={startVoice}
          className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-medium text-white"
        >
          {listening ? "…" : labels.voice}
        </button>
        <label className="cursor-pointer rounded-xl border border-brand-sky/40 bg-brand-surface px-4 py-3 text-center text-sm font-medium text-brand-primary">
          {labels.photo}
          <input type="file" accept="image/*" capture="environment" className="hidden" />
        </label>
      </div>
      <button
        type="button"
        disabled={busy || !text.trim()}
        onClick={generate}
        className="rounded-xl bg-brand-primary px-4 py-3.5 text-base font-semibold text-white disabled:opacity-50"
      >
        {busy ? "…" : labels.generate}
      </button>
    </div>
  );
}
