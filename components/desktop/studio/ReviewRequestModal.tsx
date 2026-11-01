"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/domain/types";
import { useBusiness } from "@/context/BusinessContext";
import { fieldDirProps } from "@/lib/ui/field";
import {
  buildDemoAppointments,
  cleanDisplayUrl,
  defaultReviewLinks,
  openWhatsApp,
  recentlyEnded,
  reviewRequestMessage,
} from "@/lib/ops/appointments";

export function ReviewRequestModal({
  locale,
  jobHint,
  onClose,
}: {
  locale: Locale;
  jobHint?: string;
  onClose: () => void;
}) {
  const { profile } = useBusiness();
  const links = useMemo(() => {
    const raw = defaultReviewLinks(profile.name);
    return {
      google: cleanDisplayUrl(raw.google),
      easy: cleanDisplayUrl(raw.easy),
    };
  }, [profile.name]);

  const recent = recentlyEnded(buildDemoAppointments(locale), 24);
  const [clientName, setClientName] = useState("");
  const phone = recent?.client.phone ?? "";
  const field = fieldDirProps(locale);

  const composed = useMemo(() => {
    const base = reviewRequestMessage(
      locale,
      profile.name,
      clientName.trim() || null,
      links.google,
      links.easy,
    );
    if (!jobHint?.trim()) return base;
    return locale === "he"
      ? `${base}\n\nלגבי העבודה: ${jobHint.trim()}`
      : `${base}\n\nAbout the job: ${jobHint.trim()}`;
  }, [locale, profile.name, clientName, links.google, links.easy, jobHint]);

  const [text, setText] = useState(composed);
  const [copied, setCopied] = useState(false);

  // Live-sync body when name / links / job hint change (unless user heavily edited —
  // we always refresh on name for the requested UX)
  useEffect(() => {
    setText(composed);
  }, [composed]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        dir={locale === "he" ? "rtl" : "ltr"}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl"
      >
        <h2 className="text-lg font-bold">
          {locale === "he"
            ? "בקש המלצה מהלקוח על עבודה זו"
            : "Ask the client for a review on this job"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {locale === "he"
            ? "העתיקו או שלחו בוואטסאפ עם קישורי Google / Easy נקיים"
            : "Copy or send via WhatsApp with clean Google / Easy links"}
        </p>

        <label className="mt-4 block text-sm text-slate-700">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            {locale === "he"
              ? "שם הלקוח/ה (אופציונלי)"
              : "Client name (optional)"}
          </span>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={locale === "he" ? "לדוגמה: מיכל" : "e.g. Michal"}
            dir={field.dir}
            className={field.className}
            autoComplete="off"
          />
        </label>

        <p className="mt-3 break-all text-[11px] text-slate-500">
          Google: {links.google}
          <br />
          Easy: {links.easy}
        </p>

        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir={field.dir}
          className={`mt-3 ${field.className}`}
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-slate-600"
          >
            {locale === "he" ? "סגור" : "Close"}
          </button>
          <button
            type="button"
            onClick={copy}
            className="rounded-xl border border-[#4DACFF] px-4 py-2 text-sm font-semibold text-[#0077F6]"
          >
            {copied
              ? locale === "he"
                ? "הועתק"
                : "Copied"
              : locale === "he"
                ? "העתק"
                : "Copy"}
          </button>
          <button
            type="button"
            disabled={!phone}
            onClick={() => {
              if (!phone) return;
              openWhatsApp(phone, text);
            }}
            className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {locale === "he" ? "שלח בוואטסאפ" : "Send on WhatsApp"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
