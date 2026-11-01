"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { BusinessProfile, Locale } from "@/lib/domain/types";
import { useBusiness } from "@/context/BusinessContext";
import {
  BusinessModal,
  emptyFormValues,
  formValuesToPatch,
  profileToFormValues,
  type BusinessFormValues,
} from "@/components/businesses/BusinessModal";

export function BusinessSwitcher({
  locale,
  variant = "sidebar",
}: {
  locale: Locale;
  variant?: "sidebar" | "header";
}) {
  const {
    businesses,
    activeBusinessId,
    profile,
    switchBusiness,
    addBusiness,
    updateBusiness,
    deleteBusiness,
  } = useBusiness();
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<BusinessProfile | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function openCreate() {
    setEditTarget(null);
    setModalMode("create");
    setOpen(false);
  }

  function openEdit(b: BusinessProfile, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setEditTarget(b);
    setModalMode("edit");
    setOpen(false);
  }

  function confirmDelete(b: BusinessProfile, e: React.MouseEvent) {
    e.stopPropagation();
    if (businesses.length <= 1) {
      window.alert(
        locale === "he"
          ? "לא ניתן למחוק את העסק האחרון."
          : "Cannot delete the last business.",
      );
      return;
    }
    const ok = window.confirm(
      locale === "he"
        ? `למחוק את "${b.name}"? פעולה זו אינה הפיכה.`
        : `Delete "${b.name}"? This cannot be undone.`,
    );
    if (!ok) return;
    deleteBusiness(b.id);
  }

  function handleSubmit(values: BusinessFormValues) {
    if (modalMode === "edit" && editTarget) {
      updateBusiness(editTarget.id, formValuesToPatch(values));
    } else {
      addBusiness(formValuesToPatch(values));
    }
    setModalMode(null);
    setEditTarget(null);
  }

  const triggerClass =
    variant === "sidebar"
      ? "flex w-full items-center justify-between gap-2 rounded-xl bg-white/15 px-3 py-2 text-start text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/25"
      : "flex max-w-[11rem] items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30";

  const editInitial =
    modalMode === "edit" && editTarget
      ? profileToFormValues(editTarget)
      : emptyFormValues();

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className={triggerClass}
        >
          <span className="min-w-0 truncate">{profile.name}</span>
          <span aria-hidden className="shrink-0 text-[10px] opacity-90">
            ▼
          </span>
        </button>

        {open && (
          <div
            id={listId}
            role="listbox"
            className={`absolute z-[60] mt-2 w-72 overflow-hidden rounded-xl border border-[#BAE6FD] bg-white text-slate-900 shadow-xl ${
              variant === "sidebar" ? "start-0" : "end-0"
            }`}
          >
            <ul className="max-h-64 overflow-y-auto py-1">
              {businesses.map((b) => (
                <li
                  key={b.id}
                  className={`flex items-center gap-1 px-2 py-1.5 ${
                    b.id === activeBusinessId ? "bg-[#BAE6FD]/50" : ""
                  }`}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={b.id === activeBusinessId}
                    onClick={() => {
                      switchBusiness(b.id);
                      setOpen(false);
                    }}
                    className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-start text-sm ${
                      b.id === activeBusinessId
                        ? "font-semibold text-[#0077F6]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block truncate">{b.name}</span>
                    <span className="block truncate text-[11px] font-normal text-slate-500">
                      {b.trade}
                    </span>
                  </button>
                  <button
                    type="button"
                    title={locale === "he" ? "ערוך" : "Edit"}
                    aria-label={locale === "he" ? "ערוך" : "Edit"}
                    onClick={(e) => openEdit(b, e)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-[#BAE6FD]/50 hover:text-[#0077F6]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title={locale === "he" ? "מחק" : "Delete"}
                    aria-label={locale === "he" ? "מחק" : "Delete"}
                    onClick={(e) => confirmDelete(b, e)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={openCreate}
              className="w-full border-t border-[#BAE6FD] bg-[#F8FAFC] px-3 py-3 text-sm font-bold text-[#0077F6] hover:bg-[#BAE6FD]/40"
            >
              {locale === "he" ? "+ הוסף עסק חדש" : "+ Add new business"}
            </button>
          </div>
        )}
      </div>

      {modalMode && (
        <BusinessModal
          key={
            modalMode === "edit" && editTarget
              ? `edit-${editTarget.id}`
              : "create"
          }
          locale={locale}
          title={
            modalMode === "edit"
              ? locale === "he"
                ? "עריכת פרטי עסק"
                : "Edit business"
              : locale === "he"
                ? "עסק חדש"
                : "New business"
          }
          initial={editInitial}
          submitLabel={
            modalMode === "edit"
              ? locale === "he"
                ? "שמור שינויים"
                : "Save changes"
              : locale === "he"
                ? "צור עסק"
                : "Create business"
          }
          onClose={() => {
            setModalMode(null);
            setEditTarget(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
