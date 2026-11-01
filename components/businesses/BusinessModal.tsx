"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { BusinessProfile, Locale } from "@/lib/domain/types";
import { fieldDirProps } from "@/lib/ui/field";

export type BusinessFormValues = {
  name: string;
  trade: string;
  phone: string;
  workingHours: string;
  serviceArea: string;
  websiteUrl: string;
};

export function emptyFormValues(): BusinessFormValues {
  return {
    name: "",
    trade: "",
    phone: "",
    workingHours: "",
    serviceArea: "",
    websiteUrl: "",
  };
}

export function profileToFormValues(p: BusinessProfile): BusinessFormValues {
  const serviceArea = [p.location.city, p.location.region]
    .filter(Boolean)
    .join(", ");
  return {
    name: p.name ?? "",
    trade: p.trade ?? "",
    phone: p.phone ?? "",
    workingHours: p.workingHours ?? "",
    serviceArea,
    websiteUrl: p.websiteUrl ?? "",
  };
}

export function formValuesToPatch(
  values: BusinessFormValues,
): Partial<BusinessProfile> {
  const parts = values.serviceArea
    .split(/[,·|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    name: values.name.trim(),
    trade: values.trade.trim(),
    phone: values.phone.trim(),
    workingHours: values.workingHours.trim() || undefined,
    websiteUrl: values.websiteUrl.trim() || undefined,
    location: {
      city: parts[0] ?? "",
      region: parts.slice(1).join(", ") || undefined,
    },
  };
}

/**
 * Create / Edit business modal.
 * Edit mode MUST receive `initial` pre-filled from the selected profile.
 * Create mode uses blank `emptyFormValues()`.
 */
export function BusinessModal({
  locale,
  title,
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: {
  locale: Locale;
  title: string;
  /** Pre-populated values for edit; omit / empty for create */
  initial?: BusinessFormValues;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (values: BusinessFormValues) => void;
  /** Preferred remount key on the JSX element: key={`edit-${id}`}|`"create"` */
  formKey?: string;
}) {
  // Parents must pass React `key={formKey}` so edit vs create remounts with fresh seed.
  const [values, setValues] = useState<BusinessFormValues>(
    () => initial ?? emptyFormValues(),
  );
  const [mounted, setMounted] = useState(false);
  const inputProps = fieldDirProps(locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  function set<K extends keyof BusinessFormValues>(
    key: K,
    value: BusinessFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const fields: Array<{
    key: keyof BusinessFormValues;
    label: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
  }> = [
    {
      key: "name",
      label: locale === "he" ? "שם העסק" : "Business name",
      required: true,
      placeholder: locale === "he" ? "לדוגמה: ניר אינסטלציה" : "e.g. Nir Plumbing",
    },
    {
      key: "trade",
      label: locale === "he" ? "תחום / תעשייה" : "Trade / industry",
      required: true,
      placeholder: locale === "he" ? "אינסטלציה" : "Plumbing",
    },
    {
      key: "phone",
      label: locale === "he" ? "טלפון" : "Phone",
      required: true,
      placeholder: "050-1234567",
    },
    {
      key: "workingHours",
      label: locale === "he" ? "שעות פעילות" : "Operating hours",
      placeholder: locale === "he" ? "א׳–ה׳ 08:00–18:00" : "Sun–Thu 08:00–18:00",
    },
    {
      key: "serviceArea",
      label: locale === "he" ? "אזור שירות" : "Service area",
      placeholder: locale === "he" ? "רעננה, השרון" : "Ra'anana, Sharon",
    },
    {
      key: "websiteUrl",
      label: locale === "he" ? "אתר / קישור" : "Website URL",
      type: "url",
      placeholder: "https://",
    },
  ];

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-modal-title"
    >
      <button
        type="button"
        aria-label="Close backdrop"
        className="absolute inset-0 z-0 bg-slate-950/55 backdrop-blur-md"
        onClick={onClose}
      />
      <form
        dir={locale === "he" ? "rtl" : "ltr"}
        onSubmit={(e) => {
          e.preventDefault();
          if (!values.name.trim()) return;
          onSubmit(values);
        }}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="business-modal-title"
          className="text-lg font-bold text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {locale === "he"
            ? "המשתמש עורך בכל עת · ה־AI רק קורא (למניעת הזיות)."
            : "Fully editable by you · AI only reads these (anti-hallucination)."}
        </p>

        {fields.map((f) => (
          <label key={f.key} className="mt-3 block text-sm text-slate-700">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              {f.label}
            </span>
            <input
              required={f.required}
              type={f.type ?? "text"}
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              dir={inputProps.dir}
              className={inputProps.className}
              autoComplete="off"
            />
          </label>
        ))}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {locale === "he" ? "ביטול" : "Cancel"}
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[#0077F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

/** Alias used by older imports */
export const BusinessProfileFormModal = BusinessModal;
