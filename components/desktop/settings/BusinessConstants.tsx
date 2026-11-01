"use client";

import { useState } from "react";
import type { Locale } from "@/lib/domain/types";
import { isolatePhone, isolateUrl } from "@/lib/i18n/bidi";
import { useBusiness } from "@/context/BusinessContext";
import {
  BusinessModal,
  formValuesToPatch,
  profileToFormValues,
} from "@/components/businesses/BusinessModal";

export function BusinessConstants({ locale }: { locale: Locale }) {
  const { profile, updateActiveProfile } = useBusiness();
  const [editing, setEditing] = useState(false);
  const phoneDigits = profile.phone.replace(/\D/g, "");
  const waLink = isolateUrl(`https://wa.me/${phoneDigits}`);

  return (
    <section className="rounded-2xl border border-[#BAE6FD] bg-white p-5 text-slate-900 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">
            {locale === "he"
              ? "קבועי עסק מאומתים (לא לשינוי ע״י ה־AI)"
              : "Verified business constants (immutable for AI)"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {locale === "he"
              ? "עובדות יסוד ל־grounding — הסוכן לא ממציא מעבר להן. אתם יכולים לערוך בכל עת."
              : "Ground-truth for AI — the agent never invents beyond these. You can edit anytime."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-xl border border-[#4DACFF] bg-white px-4 py-2 text-sm font-semibold text-[#0077F6] shadow-sm"
        >
          {locale === "he" ? "ערוך פרטי עסק" : "Edit business details"}
        </button>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">
            {locale === "he" ? "שם העסק" : "Business name"}
          </dt>
          <dd className="font-medium text-slate-900">{profile.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">
            {locale === "he" ? "טלפון מאומת" : "Verified phone"}
          </dt>
          <dd className="font-medium text-slate-900">
            {isolatePhone(profile.phone)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">
            {locale === "he" ? "תחום / שירותים" : "Trade / services"}
          </dt>
          <dd className="font-medium text-slate-900">{profile.trade}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">
            {locale === "he" ? "שעות פעילות" : "Working hours"}
          </dt>
          <dd className="font-medium text-slate-900">
            {profile.workingHours ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">
            {locale === "he" ? "אזורי שירות" : "Service areas"}
          </dt>
          <dd className="font-medium text-slate-900">
            {[profile.location.city, profile.location.region]
              .filter(Boolean)
              .join(" · ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">
            {locale === "he" ? "אתר" : "Website"}
          </dt>
          <dd className="break-all font-medium text-slate-900">
            {profile.websiteUrl ? isolateUrl(profile.websiteUrl) : "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-500">
            {locale === "he" ? "קישור CTA לוואטסאפ" : "WhatsApp CTA link"}
          </dt>
          <dd className="break-all font-medium text-slate-900">{waLink}</dd>
        </div>
      </dl>

      {profile.immutableFacts.length > 0 && (
        <ul className="mt-4 list-disc ps-5 text-sm text-slate-700">
          {profile.immutableFacts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      {editing && (
        <BusinessModal
          key={`settings-edit-${profile.id}`}
          locale={locale}
          title={locale === "he" ? "עריכת פרטי עסק" : "Edit business details"}
          initial={profileToFormValues(profile)}
          submitLabel={locale === "he" ? "שמור שינויים" : "Save changes"}
          onClose={() => setEditing(false)}
          onSubmit={(values) => {
            updateActiveProfile(formValuesToPatch(values));
            setEditing(false);
          }}
        />
      )}
    </section>
  );
}
