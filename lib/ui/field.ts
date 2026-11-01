import type { Locale } from "@/lib/domain/types";

/** Visible, high-contrast form controls (never inherit text-white). */
export const FIELD_INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-[#0077F6] focus:ring-2 focus:ring-[#0077F6]/20";

export function fieldDirProps(locale: Locale): {
  dir: "rtl" | "ltr";
  className: string;
} {
  return locale === "he"
    ? { dir: "rtl", className: `${FIELD_INPUT_CLASS} text-right` }
    : { dir: "ltr", className: `${FIELD_INPUT_CLASS} text-left` };
}
