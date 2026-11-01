"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/domain/types";
import { useBusiness } from "@/context/BusinessContext";
import { isolateUrl } from "@/lib/i18n/bidi";
import {
  defaultReviewLinks,
  reviewRequestMessage,
} from "@/lib/ops/appointments";

export function ReviewMagnetHeader({ locale }: { locale: Locale }) {
  const { profile } = useBusiness();
  const links = useMemo(() => defaultReviewLinks(profile.name), [profile.name]);
  const [copied, setCopied] = useState(false);

  const script = reviewRequestMessage(
    locale,
    profile.name,
    locale === "he" ? "לקוח יקר" : "valued client",
    links.google,
    links.easy,
  );

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function downloadQr() {
    const target = encodeURIComponent(links.google);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${target}&color=0077F6`;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${profile.name.replace(/\s+/g, "-")}-review-qr.png`;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
  }

  return (
    <section className="rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {locale === "he" ? "מגנט ביקורות" : "Review magnet"}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {locale === "he"
          ? "קישורי ביקורת ישירים לגוגל ואיזי — לשליחה ללקוחות"
          : "Direct Google & Easy review links for client outreach"}
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Google</dt>
          <dd className="break-all font-medium text-[#0077F6]">
            {isolateUrl(links.google)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Easy.co.il</dt>
          <dd className="break-all font-medium text-[#0077F6]">
            {isolateUrl(links.easy)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyScript}
          className="rounded-xl bg-[#0077F6] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {copied
            ? locale === "he"
              ? "הועתק!"
              : "Copied!"
            : locale === "he"
              ? "העתק נוסח בקשה לוואטסאפ"
              : "Copy WhatsApp request script"}
        </button>
        <button
          type="button"
          onClick={downloadQr}
          className="rounded-xl border-2 border-[#4DACFF] bg-white px-4 py-2.5 text-sm font-semibold text-[#0077F6]"
        >
          {locale === "he" ? "הורד קוד QR ממותג" : "Download branded QR"}
        </button>
      </div>
    </section>
  );
}
