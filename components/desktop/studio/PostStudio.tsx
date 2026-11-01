"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale, PostPayload } from "@/lib/domain/types";
import { PLATFORM_CHAR_LIMITS, PLATFORM_LABELS } from "@/lib/domain/types";
import { PlatformLogo } from "@/components/domain/PlatformLogo";
import { StatusBadge } from "@/components/domain/StatusBadge";
import type { SocialPlatformId } from "@/types/social";
import { buildRawFallbackPost } from "@/lib/ai/fetch-with-timeout";
import { useChannels } from "@/context/ChannelContext";
import { useSocialWorker } from "@/hooks/useSocialWorker";
import {
  PlatformPreviewCanvas,
  type PreviewAspect,
} from "@/components/desktop/studio/PlatformPreviewCanvas";
import { ReviewRequestModal } from "@/components/desktop/studio/ReviewRequestModal";

type CoachState = { questions: string[]; answers: string[] };
type MediaItem = { name: string; kind: "image" | "video"; url?: string };
type MediaMode = "single" | "before_after";

function DropSlot({
  locale,
  label,
  hint,
  media,
  onFiles,
}: {
  locale: Locale;
  label: string;
  hint?: string;
  media: MediaItem | null;
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
      className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#4DACFF] bg-[#BAE6FD]/20 px-3 py-5 text-center"
    >
      <p className="text-sm font-semibold text-[#005AC2]">{label}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <input
        type="file"
        accept="image/jpeg,image/png,image/*,video/mp4,video/quicktime"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      {media?.url && media.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt=""
          className="mt-1 h-20 w-full max-w-[160px] rounded-lg object-cover"
        />
      ) : media ? (
        <p className="mt-1 text-xs font-medium text-[#005AC2]">
          {media.kind === "video" ? "🎬" : "🖼️"} {media.name}
        </p>
      ) : (
        <p className="text-[11px] text-slate-400">
          {locale === "he" ? "גררו או לחצו" : "Drop or click"}
        </p>
      )}
    </label>
  );
}

export function PostStudio({
  locale,
  initialGap,
  preferMedia,
  slotPrompt,
}: {
  locale: Locale;
  initialGap?: {
    gapId: string;
    windowStart: string;
    windowEnd: string;
  } | null;
  preferMedia?: boolean;
  slotPrompt?: string | null;
}) {
  const { enabledAccounts, profile } = useChannels();
  const { generateGroundedPost, loading: agentLoading, error: agentError } =
    useSocialWorker(locale);
  const enabled = enabledAccounts;

  const [activeId, setActiveId] = useState(enabled[0]?.id ?? "");
  const [prompt, setPrompt] = useState(
    slotPrompt ||
      (initialGap
        ? locale === "he"
          ? "יש לנו חלון פנוי לקבלת לקוחות. מוזמנים לתאם."
          : "We have an open slot for customers. Welcome to book."
        : ""),
  );
  const [recording, setRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const promptRef = useRef(prompt);
  const [mediaMode, setMediaMode] = useState<MediaMode>("single");
  const [media, setMedia] = useState<MediaItem | null>(
    preferMedia ? { name: "field-upload.jpg", kind: "image" } : null,
  );
  const [beforeMedia, setBeforeMedia] = useState<MediaItem | null>(null);
  const [afterMedia, setAfterMedia] = useState<MediaItem | null>(null);
  const [post, setPost] = useState<PostPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"auto" | "coached" | null>(null);
  const [coach, setCoach] = useState<CoachState | null>(null);
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [aspect, setAspect] = useState<PreviewAspect>("1:1");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [mediaGenerating, setMediaGenerating] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  function stopMicIfActive() {
    if (!recording && !recognitionRef.current) return promptRef.current;
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    setRecording(false);
    return promptRef.current;
  }

  useEffect(() => {
    if (slotPrompt) setPrompt(slotPrompt);
  }, [slotPrompt]);

  useEffect(() => {
    if (!enabled.find((a) => a.id === activeId)) {
      setActiveId(enabled[0]?.id ?? "");
    }
  }, [enabled, activeId]);

  const activeVariant = post?.variants.find(
    (v) => v.connectedAccountId === activeId,
  );
  const activeAccount = enabled.find((a) => a.id === activeId);

  const visibleVariants = useMemo(() => {
    if (!post) return [];
    const enabledIds = new Set(enabled.map((a) => a.id));
    return post.variants.filter((v) => enabledIds.has(v.connectedAccountId));
  }, [post, enabled]);

  const mediaNames = useMemo(() => {
    if (mediaMode === "before_after") {
      return [beforeMedia?.name, afterMedia?.name].filter(Boolean) as string[];
    }
    return media?.name ? [media.name] : [];
  }, [mediaMode, media, beforeMedia, afterMedia]);

  function toggleMic() {
    if (recording) {
      recognitionRef.current?.stop?.();
      setRecording(false);
      return;
    }
    const SR =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setPrompt(
        (t) =>
          t ||
          (locale === "he"
            ? "תיקנתי נזילה בכיור ברעננה היום"
            : "Fixed a sink leak in Ra'anana today"),
      );
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = locale === "he" ? "he-IL" : "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    setRecording(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setPrompt(text);
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    rec.start();
  }

  function fileToMedia(files: FileList | null): MediaItem | null {
    const file = files?.[0];
    if (!file) return null;
    const kind = file.type.startsWith("video/") ? "video" : "image";
    return { name: file.name, kind, url: URL.createObjectURL(file) };
  }

  async function generateAiImage(forPrompt?: string) {
    const seed = (forPrompt ?? prompt).trim();
    if (!seed) return;
    setMediaGenerating(true);
    setMediaError(null);
    try {
      const res = await fetch("/api/media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: seed,
          trade: profile.trade,
          aspectRatio: aspect === "4:5" ? "1:1" : aspect,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };
      if (!data.success || !data.url) {
        throw new Error(data.error || "media_generate_failed");
      }
      setMediaMode("single");
      setMedia({
        name: "ai-generated.jpg",
        kind: "image",
        url: data.url,
      });
    } catch (err) {
      setMediaError(
        err instanceof Error
          ? err.message
          : locale === "he"
            ? "יצירת תמונה נכשלה"
            : "Image generation failed",
      );
    } finally {
      setMediaGenerating(false);
    }
  }

  async function generate(extraAnswers?: string[]) {
    const committedPrompt = stopMicIfActive();
    setBusy(true);
    setFallbackNote(null);
    setPublishMsg(null);
    const enriched =
      extraAnswers && extraAnswers.length
        ? `${committedPrompt}\n${extraAnswers.filter(Boolean).join("\n")}`
        : committedPrompt;

    const agent = await generateGroundedPost(enriched, initialGap ?? undefined);

    setBusy(false);

    if (!agent) {
      const fb = buildRawFallbackPost({
        promptText: committedPrompt,
        locale,
      });
      setFallbackNote(agentError || fb.message);
      setMode("auto");
      setCoach(null);
      const synthetic: PostPayload = {
        id: `fallback_${Date.now()}`,
        orgId: profile.orgId,
        businessId: profile.id,
        sourceCaptureId: "raw",
        seedGapId: initialGap?.gapId,
        groundingRefs: ["user_input:raw"],
        variants: enabled.map((a) => ({
          platform: a.platform,
          connectedAccountId: a.id,
          caption: committedPrompt,
          mediaAssetIds: mediaNames,
          charLimit: PLATFORM_CHAR_LIMITS[a.platform],
        })),
        publicationPlan: enabled.map((a) => ({
          connectedAccountId: a.id,
          mode: a.mode,
          status: "queued",
        })),
      };
      setPost(synthetic);
      if (synthetic.variants[0])
        setActiveId(synthetic.variants[0].connectedAccountId);
      return;
    }

    const data = {
      post: agent.post,
      mode: agent.mode,
      questions: agent.questions,
    };

    // Prefer live structured generation captions for each platform tab
    const gen = agent.generation;
    const liveCaption: Record<string, string | undefined> = {
      whatsapp: gen.whatsapp,
      facebook: gen.facebook,
      instagram: gen.instagram,
      tiktok: gen.tiktok_reels_hook,
      youtube: gen.youtube ?? gen.tiktok_reels_hook,
      linkedin: gen.linkedin,
      x: gen.x,
      threads: gen.threads ?? gen.instagram,
      reddit: gen.reddit ?? gen.facebook,
      google_business: gen.google_business ?? gen.facebook,
      easy: gen.easy ?? gen.facebook,
    };

    let nextPost = data.post;
    if (nextPost) {
      const enabledIds = new Set(enabled.map((a) => a.id));
      const enabledPlatforms = new Set(enabled.map((a) => a.platform));
      nextPost = {
        ...nextPost,
        variants: enabled
          .map((acc) => {
            const existing =
              nextPost!.variants.find((v) => v.platform === acc.platform) ||
              nextPost!.variants.find((v) =>
                enabledIds.has(v.connectedAccountId),
              );
            return {
              platform: acc.platform,
              connectedAccountId: acc.id,
              caption:
                liveCaption[acc.platform] ||
                existing?.caption ||
                committedPrompt,
              hashtags: existing?.hashtags,
              cta: existing?.cta,
              mediaAssetIds: existing?.mediaAssetIds?.length
                ? existing.mediaAssetIds
                : mediaNames,
              charLimit: PLATFORM_CHAR_LIMITS[acc.platform],
              dirty: existing?.dirty,
            };
          })
          .filter((v) => enabledPlatforms.has(v.platform)),
        publicationPlan: enabled.map((a) => ({
          connectedAccountId: a.id,
          mode: a.mode,
          status: "queued" as const,
        })),
      };
    }

    if (data.mode === "coached" && data.questions?.length && !extraAnswers) {
      setMode("coached");
      setCoach({
        questions: data.questions,
        answers: data.questions.map(() => ""),
      });
      if (nextPost) {
        setPost(nextPost);
        sessionStorage.setItem("ols_post", JSON.stringify(nextPost));
      }
      return;
    }

    setMode("auto");
    setCoach(null);
    if (nextPost) {
      setPost(nextPost);
      if (nextPost.variants[0])
        setActiveId(nextPost.variants[0].connectedAccountId);
      sessionStorage.setItem("ols_post", JSON.stringify(nextPost));
      // No uploaded media → auto-generate visual for all tabs
      if (
        mediaMode === "single" &&
        !media?.url &&
        !beforeMedia?.url &&
        !afterMedia?.url
      ) {
        void generateAiImage(committedPrompt);
      }
    }
  }

  async function updateCaption(caption: string) {
    if (!post || !activeId) return;
    const optimistic: PostPayload = {
      ...post,
      variants: post.variants.map((v) =>
        v.connectedAccountId === activeId
          ? { ...v, caption, dirty: true }
          : v,
      ),
    };
    setPost(optimistic);
    if (!post.id.startsWith("fallback_")) {
      await fetch(`/api/posts/${post.id}/variant`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectedAccountId: activeId, caption }),
      });
    }
  }

  async function replaceMediaForTab() {
    if (!post || !activeId) return;
    const mediaAssetIds = [`tab-media-${Date.now()}`];
    setPost({
      ...post,
      variants: post.variants.map((v) =>
        v.connectedAccountId === activeId
          ? { ...v, mediaAssetIds, dirty: true }
          : v,
      ),
    });
  }

  async function publishAll() {
    if (!post) return;
    if (post.id.startsWith("fallback_")) {
      setPublishMsg(
        locale === "he"
          ? "מצב גיבוי — השתמשו בהעתק ופתח לכל ערוץ."
          : "Fallback mode — use Copy & Open per channel.",
      );
      return;
    }
    sessionStorage.setItem("ols_post", JSON.stringify(post));
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id, device: "desktop" }),
    });
    const data = await res.json();
    setPublishMsg(
      locale === "he"
        ? `פרסום הושלם · ${data.results?.length ?? 0} ערוצים`
        : `Publication finished · ${data.results?.length ?? 0} channels`,
    );
  }

  async function copyAndOpen() {
    if (!activeAccount || !activeVariant) return;
    try {
      await navigator.clipboard.writeText(activeVariant.caption);
    } catch {
      /* ignore */
    }
    if (activeAccount.deepLinkTemplate) {
      window.location.href = activeAccount.deepLinkTemplate.replace(
        "{text}",
        encodeURIComponent(activeVariant.caption),
      );
      return;
    }
    if (activeAccount.webComposerUrl) {
      window.open(activeAccount.webComposerUrl, "_blank");
    }
  }

  return (
    <div className="grid min-h-[70vh] grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left — Input Bay */}
      <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {locale === "he" ? "קלט לפוסט" : "Post input"}
        </h2>
        {(initialGap || slotPrompt) && (
          <StatusBadge tone="warn">
            {locale === "he" ? "מחלון יומן" : "From diary gap"}
          </StatusBadge>
        )}

        <button
          type="button"
          onClick={toggleMic}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white transition ${
            recording ? "animate-pulse bg-red-500" : ""
          }`}
          style={
            recording
              ? undefined
              : {
                  backgroundImage:
                    "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
                }
          }
        >
          <span aria-hidden>{recording ? "⏹" : "🎤"}</span>
          {recording
            ? locale === "he"
              ? "עצור הקלטה"
              : "Stop Recording"
            : locale === "he"
              ? "הקלטה קולית"
              : "Record Voice"}
        </button>

        <div
          className="inline-flex rounded-full bg-[#005AC2]/10 p-1 self-start"
          role="group"
          aria-label={locale === "he" ? "מצב מדיה" : "Media mode"}
        >
          <button
            type="button"
            onClick={() => setMediaMode("single")}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              mediaMode === "single"
                ? "bg-white font-semibold text-[#0077F6] shadow-sm"
                : "text-slate-500"
            }`}
          >
            {locale === "he" ? "מדיה רגילה" : "Regular media"}
          </button>
          <button
            type="button"
            onClick={() => setMediaMode("before_after")}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              mediaMode === "before_after"
                ? "bg-white font-semibold text-[#0077F6] shadow-sm"
                : "text-slate-500"
            }`}
          >
            {locale === "he" ? "תמונת לפני / אחרי" : "Before / After"}
          </button>
        </div>

        {mediaMode === "single" ? (
          <>
            <DropSlot
              locale={locale}
              label={
                locale === "he"
                  ? "גררו תמונה/וידאו או לחצו לבחירה"
                  : "Drop image/video or click to browse"
              }
              hint="JPG, PNG, MP4, MOV"
              media={media}
              onFiles={(files) => {
                const next = fileToMedia(files);
                if (next) setMedia(next);
              }}
            />
            <button
              type="button"
              disabled={mediaGenerating || !prompt.trim()}
              onClick={() => generateAiImage()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#4DACFF] bg-white px-4 py-2.5 text-sm font-semibold text-[#0077F6] disabled:opacity-50"
            >
              {mediaGenerating && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[#0077F6]/30 border-t-[#0077F6]"
                  aria-hidden
                />
              )}
              {mediaGenerating
                ? locale === "he"
                  ? "יוצר תמונה…"
                  : "Generating image…"
                : locale === "he"
                  ? "צור תמונה עם AI"
                  : "Create image with AI"}
            </button>
            {mediaError && (
              <p className="text-xs text-amber-700">{mediaError}</p>
            )}
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <DropSlot
              locale={locale}
              label={
                locale === "he" ? "תמונת לפני (Before)" : "Before photo"
              }
              media={beforeMedia}
              onFiles={(files) => {
                const next = fileToMedia(files);
                if (next) setBeforeMedia(next);
              }}
            />
            <DropSlot
              locale={locale}
              label={locale === "he" ? "תמונת אחרי (After)" : "After photo"}
              media={afterMedia}
              onFiles={(files) => {
                const next = fileToMedia(files);
                if (next) setAfterMedia(next);
              }}
            />
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          dir={locale === "he" ? "rtl" : "ltr"}
          className={`w-full rounded-xl border border-slate-300 bg-white p-3 font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0077F6] focus:ring-2 focus:ring-[#0077F6]/20 ${locale === "he" ? "text-right" : "text-left"}`}
        />

        {mode && (
          <StatusBadge tone={mode === "auto" ? "ok" : "warn"}>
            {mode === "auto"
              ? locale === "he"
                ? "מצב אוטומטי"
                : "Auto mode"
              : locale === "he"
                ? "מצב מודרך"
                : "Coached mode"}
          </StatusBadge>
        )}

        {coach && (
          <div className="space-y-3 rounded-xl bg-[#F8FAFC] p-3">
            {coach.questions.map((q, i) => (
              <label key={q} className="block text-sm">
                <span>{q}</span>
                <input
                  dir={locale === "he" ? "rtl" : "ltr"}
                  className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 outline-none focus:border-[#0077F6] focus:ring-2 focus:ring-[#0077F6]/20 ${locale === "he" ? "text-right" : "text-left"}`}
                  value={coach.answers[i] ?? ""}
                  onChange={(e) => {
                    const answers = [...coach.answers];
                    answers[i] = e.target.value;
                    setCoach({ ...coach, answers });
                  }}
                />
              </label>
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => generate(coach.answers)}
              className="rounded-xl bg-[#0077F6] px-4 py-2 text-sm font-semibold text-white"
            >
              {locale === "he" ? "המשך ליצירת פוסט" : "Continue to post"}
            </button>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy || agentLoading || !prompt.trim()}
            onClick={() => generate()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0077F6] px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {(busy || agentLoading) && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden
              />
            )}
            {busy || agentLoading
              ? locale === "he"
                ? "יוצר פוסט…"
                : "Generating…"
              : locale === "he"
                ? "צור פוסט מבוסס עובדות"
                : "Generate grounded post"}
          </button>
          <button
            type="button"
            onClick={() => setReviewModalOpen(true)}
            className="rounded-xl border-2 border-[#4DACFF] bg-white px-4 py-3 text-sm font-semibold text-[#0077F6]"
          >
            {locale === "he"
              ? "בקש המלצה מהלקוח על עבודה זו"
              : "Ask client for a review on this job"}
          </button>
        </div>
        {fallbackNote && (
          <p className="text-sm text-amber-700">{fallbackNote}</p>
        )}
        {agentError && !fallbackNote && (
          <p className="text-sm text-amber-700">{agentError}</p>
        )}
      </section>

      {/* Right — Live Platform Inspector */}
      <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {locale === "he" ? "תצוגת פלטפורמה חיה" : "Live platform inspector"}
        </h2>

        <div className="flex flex-wrap gap-2 border-b border-[#BAE6FD]/60 pb-3">
          {enabled.map((a) => {
            const active = activeId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setActiveId(a.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-[#0077F6] text-white ring-2 ring-[#BAE6FD]"
                    : "bg-[#F8FAFC] text-slate-700 hover:bg-[#BAE6FD]/40"
                }`}
              >
                <PlatformLogo
                  platform={a.platform as SocialPlatformId}
                  className="h-4 w-4"
                />
                {PLATFORM_LABELS[a.platform][locale]}
              </button>
            );
          })}
          {!enabled.length && (
            <p className="text-sm text-slate-500">
              {locale === "he"
                ? "אין רשתות פעילות — הפעילו בהגדרות."
                : "No active networks — enable in Settings."}
            </p>
          )}
        </div>

        {activeVariant && activeAccount ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <PlatformLogo
                  platform={activeAccount.platform as SocialPlatformId}
                  className="h-5 w-5"
                />
                {PLATFORM_LABELS[activeAccount.platform][locale]}
              </div>
              <span className="text-xs text-slate-500">
                {activeVariant.caption.length}/{activeVariant.charLimit}
              </span>
            </div>
            <textarea
              value={activeVariant.caption}
              onChange={(e) => updateCaption(e.target.value)}
              rows={4}
              dir={locale === "he" ? "rtl" : "ltr"}
              className={`w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 outline-none focus:border-[#0077F6] focus:ring-2 focus:ring-[#0077F6]/20 ${locale === "he" ? "text-right" : "text-left"}`}
            />
            <PlatformPreviewCanvas
              locale={locale}
              platform={activeAccount.platform}
              caption={activeVariant.caption}
              hashtags={activeVariant.hashtags}
              mediaUrl={mediaMode === "single" ? media?.url : undefined}
              mediaKind={mediaMode === "single" ? media?.kind : undefined}
              beforeAfter={mediaMode === "before_after"}
              beforeUrl={beforeMedia?.url}
              afterUrl={afterMedia?.url}
              mediaLoading={mediaGenerating}
              aspect={aspect}
              onAspectChange={setAspect}
            />
            <button
              type="button"
              onClick={replaceMediaForTab}
              className="self-start rounded-lg border border-[#4DACFF] px-3 py-2 text-sm text-[#0077F6]"
            >
              {locale === "he"
                ? "החלף מדיה לטאב זה בלבד"
                : "Replace media (this tab only)"}
            </button>
            {visibleVariants.length > 1 && activeVariant.dirty && (
              <StatusBadge tone="warn">
                {locale === "he"
                  ? "שינוי מבודד לטאב זה"
                  : "Isolated edit on this tab"}
              </StatusBadge>
            )}

            <div className="mt-2 grid gap-2 border-t border-[#BAE6FD] pt-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={publishAll}
                className="rounded-xl px-4 py-3 font-semibold text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, #0077F6 0%, #005AC2 100%)",
                }}
              >
                {locale === "he" ? "פרסם" : "Publish"}
              </button>
              <button
                type="button"
                onClick={copyAndOpen}
                className="rounded-xl border-2 border-[#4DACFF] px-4 py-3 font-semibold text-[#0077F6]"
              >
                {locale === "he" ? "העתק" : "Copy"}
              </button>
              {publishMsg && (
                <p className="text-sm text-[#005AC2] sm:col-span-2">
                  {publishMsg}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3">
            {activeAccount ? (
              <PlatformPreviewCanvas
                locale={locale}
                platform={activeAccount.platform}
                caption={
                  prompt ||
                  (locale === "he" ? "תצוגה מקדימה…" : "Preview…")
                }
                mediaUrl={mediaMode === "single" ? media?.url : undefined}
                mediaKind={mediaMode === "single" ? media?.kind : undefined}
                beforeAfter={mediaMode === "before_after"}
                beforeUrl={beforeMedia?.url}
                afterUrl={afterMedia?.url}
                mediaLoading={mediaGenerating}
                aspect={aspect}
                onAspectChange={setAspect}
              />
            ) : null}
            <p className="text-sm text-slate-500">
              {locale === "he"
                ? "צרו פוסט כדי לערוך כיתובים ולפרסם."
                : "Generate a post to edit captions and publish."}
            </p>
          </div>
        )}
      </section>

      {reviewModalOpen && (
        <ReviewRequestModal
          locale={locale}
          jobHint={prompt}
          onClose={() => setReviewModalOpen(false)}
        />
      )}
    </div>
  );
}
