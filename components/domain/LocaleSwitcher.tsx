"use client";

import { useRouter } from "next/navigation";

export function LocaleSwitcher({
  locale,
  variant = "onBlue",
}: {
  locale: "he" | "en";
  variant?: "onBlue" | "onLight";
}) {
  const router = useRouter();

  async function setLocale(next: "he" | "en") {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    document.documentElement.lang = next;
    document.documentElement.dir = next === "he" ? "rtl" : "ltr";
    window.dispatchEvent(
      new CustomEvent("ols:locale", { detail: { locale: next } }),
    );
    router.refresh();
  }

  const shell =
    variant === "onLight"
      ? "border border-[#4DACFF]/50 bg-brand-surface"
      : "border border-white/30 bg-white/15 backdrop-blur";
  const active =
    variant === "onLight"
      ? "bg-[#0077F6] text-white"
      : "bg-white text-[#0077F6]";
  const idle = variant === "onLight" ? "text-slate-700" : "text-white";

  return (
    <div className={`inline-flex overflow-hidden rounded-lg text-sm ${shell}`}>
      <button
        type="button"
        onClick={() => setLocale("he")}
        className={`px-3 py-1.5 font-medium ${locale === "he" ? active : idle}`}
      >
        עב
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-3 py-1.5 font-medium ${locale === "en" ? active : idle}`}
      >
        EN
      </button>
    </div>
  );
}
