"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/domain/types";
import { fieldDirProps } from "@/lib/ui/field";
import { isolatePhone } from "@/lib/i18n/bidi";
import {
  type OpsAppointment,
  defaultReviewLinks,
  loadClientNotes,
  onMyWayMessage,
  openWhatsApp,
  reviewRequestMessage,
  saveClientNote,
  wazeLink,
} from "@/lib/ops/appointments";
import { useBusiness } from "@/context/BusinessContext";

export function AppointmentDrawer({
  locale,
  appointment,
  onClose,
}: {
  locale: Locale;
  appointment: OpsAppointment;
  onClose: () => void;
}) {
  const { profile } = useBusiness();
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const field = fieldDirProps(locale);
  const links = defaultReviewLinks(profile.name);

  useEffect(() => {
    setMounted(true);
    const all = loadClientNotes();
    setNote(all[appointment.client.id] ?? "");
  }, [appointment.client.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      saveClientNote(appointment.client.id, note);
      if (note.trim()) {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 800);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [note, appointment.client.id]);

  if (!mounted) return null;

  const address = appointment.address ?? appointment.client.address ?? "";
  const waze = appointment.wazeQuery ?? address;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        dir={locale === "he" ? "rtl" : "ltr"}
        className="absolute inset-y-0 end-0 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-s border-white/20 bg-white p-5 text-slate-900 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#0077F6]">
              {locale === "he" ? "פרטי תור" : "Appointment"}
            </p>
            <h2 className="mt-1 text-xl font-bold">{appointment.client.name}</h2>
            <p className="text-sm text-slate-600">{appointment.service}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700"
          >
            ✕
          </button>
        </div>

        <dl className="grid gap-2 rounded-xl border border-[#BAE6FD] bg-[#F8FAFC] p-4 text-sm">
          <div>
            <dt className="text-xs text-slate-500">
              {locale === "he" ? "טלפון" : "Phone"}
            </dt>
            <dd className="font-medium">
              {isolatePhone(appointment.client.phone)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">
              {locale === "he" ? "שעה" : "Time"}
            </dt>
            <dd className="font-medium">
              {new Date(appointment.startsAt).toLocaleString(
                locale === "he" ? "he-IL" : "en-US",
              )}
            </dd>
          </div>
          {address && (
            <div>
              <dt className="text-xs text-slate-500">
                {locale === "he" ? "כתובת" : "Address"}
              </dt>
              <dd className="font-medium">{address}</dd>
            </div>
          )}
        </dl>

        {waze && (
          <a
            href={wazeLink(waze)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#33CCFF] px-4 py-3 text-sm font-bold text-slate-900"
          >
            {locale === "he" ? "ניווט ב־Waze" : "Navigate with Waze"}
          </a>
        )}

        <label className="block text-sm">
          <span className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>
              {locale === "he"
                ? "פתק הקשר ללקוח (נשמר אוטומטית)"
                : "Client sticky note (autosave)"}
            </span>
            {savedFlash && (
              <span className="text-[#10B981]">
                {locale === "he" ? "נשמר" : "Saved"}
              </span>
            )}
          </span>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              locale === "he"
                ? "קוד שער, חניה, הוראות מיוחדות…"
                : "Gate code, parking, special instructions…"
            }
            dir={field.dir}
            className={field.className}
          />
        </label>

        <div className="mt-auto grid gap-2 border-t border-[#BAE6FD] pt-4">
          <button
            type="button"
            onClick={() =>
              openWhatsApp(
                appointment.client.phone,
                onMyWayMessage(
                  locale,
                  profile.name,
                  appointment.client.name,
                ),
              )
            }
            className="rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
          >
            {locale === "he" ? "בדרך אליך" : "On my way"}
          </button>
          <button
            type="button"
            onClick={() =>
              openWhatsApp(
                appointment.client.phone,
                reviewRequestMessage(
                  locale,
                  profile.name,
                  appointment.client.name,
                  links.google,
                  links.easy,
                ),
              )
            }
            className="rounded-xl bg-[#0077F6] px-4 py-3 text-sm font-semibold text-white"
          >
            {locale === "he" ? "בקש דירוג" : "Request rating"}
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
