"use client";

import type { Locale, Platform } from "@/lib/domain/types";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import type { SocialPlatformId } from "@/types/social";

export type PreviewAspect = "1:1" | "9:16" | "16:9" | "4:5";

function aspectClass(aspect: PreviewAspect) {
  switch (aspect) {
    case "9:16":
      return "aspect-[9/16] max-h-[420px] w-auto";
    case "16:9":
      return "aspect-video w-full";
    case "4:5":
      return "aspect-[4/5] max-h-[420px] w-full max-w-sm";
    default:
      return "aspect-square w-full max-w-sm";
  }
}

function MediaFrame({
  locale,
  mediaUrl,
  mediaKind,
  beforeUrl,
  afterUrl,
  beforeAfter,
  className,
}: {
  locale: Locale;
  mediaUrl?: string;
  mediaKind?: "image" | "video";
  beforeUrl?: string;
  afterUrl?: string;
  beforeAfter?: boolean;
  className?: string;
}) {
  if (beforeAfter && (beforeUrl || afterUrl)) {
    return (
      <div className={`relative grid grid-cols-2 overflow-hidden ${className ?? ""}`}>
        <div className="relative h-full min-h-[140px] bg-slate-200">
          {beforeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={beforeUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              {locale === "he" ? "לפני" : "Before"}
            </div>
          )}
          <span className="absolute start-2 top-2 rounded bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
            {locale === "he" ? "לפני" : "Before"}
          </span>
        </div>
        <div className="relative h-full min-h-[140px] bg-slate-300">
          {afterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={afterUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              {locale === "he" ? "אחרי" : "After"}
            </div>
          )}
          <span className="absolute end-2 top-2 rounded bg-[#0077F6]/90 px-2 py-0.5 text-[10px] font-bold text-white">
            {locale === "he" ? "אחרי" : "After"}
          </span>
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#005AC2] shadow">
          {locale === "he" ? "לפני / אחרי" : "Before / After"}
        </span>
      </div>
    );
  }

  if (mediaUrl && mediaKind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaUrl}
        alt=""
        className={`h-full w-full object-cover ${className ?? ""}`}
      />
    );
  }

  if (mediaUrl && mediaKind === "video") {
    return (
      <div
        className={`flex h-full items-center justify-center bg-slate-800 text-white ${className ?? ""}`}
      >
        🎬
      </div>
    );
  }

  return null;
}

function MediaShimmer({ label }: { label: string }) {
  return (
    <div className="relative flex h-full min-h-[160px] w-full items-center justify-center overflow-hidden bg-slate-100">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#BAE6FD]/40 via-white to-[#BAE6FD]/40" />
      <p className="relative z-10 text-xs font-semibold text-[#005AC2]">
        {label}
      </p>
    </div>
  );
}

export function PlatformPreviewCanvas({
  locale,
  platform,
  caption,
  hashtags,
  mediaUrl,
  mediaKind,
  beforeUrl,
  afterUrl,
  beforeAfter,
  mediaLoading,
  aspect,
  onAspectChange,
}: {
  locale: Locale;
  platform: Platform;
  caption: string;
  hashtags?: string[];
  mediaUrl?: string;
  mediaKind?: "image" | "video";
  beforeUrl?: string;
  afterUrl?: string;
  beforeAfter?: boolean;
  mediaLoading?: boolean;
  aspect: PreviewAspect;
  onAspectChange: (a: PreviewAspect) => void;
}) {
  const isVertical =
    platform === "tiktok" || platform === "youtube" || aspect === "9:16";
  const isWhatsApp = platform === "whatsapp";
  const isFeed =
    platform === "instagram" ||
    platform === "facebook" ||
    platform === "linkedin" ||
    platform === "threads" ||
    platform === "google_business" ||
    platform === "reddit" ||
    platform === "x" ||
    platform === "easy";

  const effectiveAspect: PreviewAspect = isVertical
    ? "9:16"
    : isFeed && (aspect === "1:1" || aspect === "4:5" || aspect === "16:9")
      ? aspect
      : "1:1";

  const hasMedia =
    Boolean(mediaUrl) ||
    (beforeAfter && (Boolean(beforeUrl) || Boolean(afterUrl)));

  const shimmerLabel =
    locale === "he" ? "יוצר תמונה עם AI…" : "Generating AI image…";

  const placeholder = mediaLoading ? (
    <MediaShimmer label={shimmerLabel} />
  ) : (
    <div className="flex h-full min-h-[140px] items-center justify-center bg-gradient-to-br from-[#4DACFF] to-[#005AC2] text-white">
      <PlatformLogo
        platform={platform as SocialPlatformId}
        className="h-10 w-10 text-white"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(["1:1", "9:16", "16:9"] as PreviewAspect[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onAspectChange(a)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              effectiveAspect === a || aspect === a
                ? "bg-white text-[#0077F6] shadow-sm ring-1 ring-[#4DACFF]"
                : "bg-[#005AC2]/10 text-slate-500"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {isWhatsApp ? (
        <div className="rounded-2xl bg-[#ECE5DD] p-4">
          <div className="ms-auto max-w-[92%] rounded-2xl rounded-ee-sm bg-[#DCF8C6] px-3 py-2 text-sm text-slate-900 shadow-sm">
            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
              {caption}
            </pre>
            {hashtags?.length ? (
              <p className="mt-2 text-xs text-[#027EB5]">
                {hashtags.join(" ")}
              </p>
            ) : null}
            {(hasMedia || mediaLoading) && (
              <div className="mt-2 overflow-hidden rounded-lg">
                {mediaLoading ? (
                  <MediaShimmer label={shimmerLabel} />
                ) : (
                  <MediaFrame
                    locale={locale}
                    mediaUrl={mediaUrl}
                    mediaKind={mediaKind}
                    beforeUrl={beforeUrl}
                    afterUrl={afterUrl}
                    beforeAfter={beforeAfter}
                    className="max-h-48"
                  />
                )}
              </div>
            )}
            <p className="mt-1 text-end text-[10px] text-slate-500">12:04 ✓✓</p>
          </div>
        </div>
      ) : isVertical ? (
        <div className="mx-auto w-full max-w-[240px] overflow-hidden rounded-[1.5rem] border-4 border-slate-900 bg-black shadow-lg">
          <div className={`relative ${aspectClass("9:16")} bg-slate-900`}>
            {mediaLoading ? (
              <div className="absolute inset-0">
                <MediaShimmer label={shimmerLabel} />
              </div>
            ) : hasMedia ? (
              <div className="absolute inset-0">
                <MediaFrame
                  locale={locale}
                  mediaUrl={mediaUrl}
                  mediaKind={mediaKind}
                  beforeUrl={beforeUrl}
                  afterUrl={afterUrl}
                  beforeAfter={beforeAfter}
                  className="h-full w-full"
                />
              </div>
            ) : (
              placeholder
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
              <p className="line-clamp-4 text-xs font-semibold leading-snug">
                {caption}
              </p>
              {hashtags?.length ? (
                <p className="mt-1 line-clamp-2 text-[10px] text-[#BAE6FD]">
                  {hashtags.join(" ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#BAE6FD] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#BAE6FD]/50 px-3 py-2">
            <PlatformLogo
              platform={platform as SocialPlatformId}
              className="h-5 w-5"
            />
            <span className="text-sm font-semibold text-slate-800">
              {locale === "he" ? "תצוגת פיד" : "Feed preview"}
            </span>
          </div>
          <div className={`mx-auto bg-slate-100 ${aspectClass(effectiveAspect)}`}>
            {mediaLoading ? (
              <MediaShimmer label={shimmerLabel} />
            ) : hasMedia ? (
              <MediaFrame
                locale={locale}
                mediaUrl={mediaUrl}
                mediaKind={mediaKind}
                beforeUrl={beforeUrl}
                afterUrl={afterUrl}
                beforeAfter={beforeAfter}
                className="h-full w-full"
              />
            ) : (
              placeholder
            )}
          </div>
          <div className="space-y-2 p-3">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">
              {caption}
            </pre>
            {hashtags?.length ? (
              <p className="text-xs text-[#027EB5]">{hashtags.join(" ")}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
