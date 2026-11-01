"use client";

import type { Locale } from "@/lib/domain/types";
import { SOCIAL_NETWORKS } from "@/types/social";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { useChannels } from "@/context/ChannelContext";

export function NetworkSettings({ locale }: { locale: Locale }) {
  const { accounts, setEnabled, setMode } = useChannels();

  return (
    <div className="grid gap-4">
      {SOCIAL_NETWORKS.map((net) => {
        const acc = accounts.find((a) => a.platform === net.id);
        const enabled = acc?.enabled ?? false;
        const mode = acc?.mode ?? net.defaultMode;

        return (
          <article
            key={net.id}
            className="rounded-2xl border border-[#BAE6FD]/80 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <PlatformLogo platform={net.id} className="h-8 w-8" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {locale === "he" ? net.nameHe : net.nameEn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {locale === "he" ? net.subtitleHe : net.subtitleEn}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(net.id, !enabled)}
                className={`relative h-8 w-14 rounded-full transition ${
                  enabled ? "bg-[#0077F6]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 start-1 h-6 w-6 rounded-full bg-white shadow transition ${
                    enabled ? "translate-x-6 rtl:-translate-x-6" : ""
                  }`}
                />
                <span className="sr-only">{enabled ? "ON" : "OFF"}</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {enabled ? (
                <StatusBadge tone="ok">
                  {locale === "he" ? "פעיל" : "ON"}
                </StatusBadge>
              ) : (
                <StatusBadge tone="warn">
                  {locale === "he" ? "כבוי" : "OFF"}
                </StatusBadge>
              )}

              <div
                className="inline-flex rounded-full bg-[#005AC2]/15 p-1"
                role="group"
                aria-label={
                  locale === "he" ? "מצב חיבור" : "Connection mode"
                }
              >
                <button
                  type="button"
                  disabled={!net.supportsOfficialApi}
                  onClick={() => setMode(net.id, "official_api")}
                  className={`rounded-full px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    mode === "official_api"
                      ? "bg-white font-semibold text-[#0077F6] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {locale === "he"
                    ? "חשבון עסקי (API)"
                    : "Business account (API)"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode(net.id, "manual_deeplink")}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    mode === "manual_deeplink"
                      ? "bg-white font-semibold text-[#0077F6] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {locale === "he"
                    ? "חשבון פרטי (העתק-הדבק)"
                    : "Personal (copy-paste)"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
