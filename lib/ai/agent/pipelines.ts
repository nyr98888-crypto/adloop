import { nanoid } from "nanoid";
import type {
  BusinessProfile,
  ConnectedAccount,
  DiaryGap,
  Locale,
  PostPayload,
  ReviewFeedItem,
  ReviewReplyPreset,
} from "@/lib/domain/types";
import { PLATFORM_CHAR_LIMITS } from "@/lib/domain/types";
import { generateGroundedPost } from "@/lib/ai/pipeline";
import { generateReviewReply } from "@/lib/ai/review-reply";
import { buildSystemPrompt } from "@/lib/ai/agent/prompts";
import { openRouterStructured, hasOpenRouterKey } from "@/lib/ai/agent/openrouter";
import {
  NudgeSchema,
  PostGenerationSchema,
  ReviewPresetsSchema,
  type NudgeResult,
  type PostGeneration,
  type ReviewPresets,
} from "@/lib/ai/agent/schemas";
import { formatOpenGapLabel } from "@/lib/calendar/format-gap";
import { isolatePhone } from "@/lib/i18n/bidi";

function asProfile(
  input: unknown,
  fallback: BusinessProfile,
): BusinessProfile {
  if (!input || typeof input !== "object") return fallback;
  return { ...fallback, ...(input as Partial<BusinessProfile>) };
}

/** Pipeline A — dead-zone / calendar gap → 1-line CTA */
export async function runNudgePipeline(opts: {
  profile: BusinessProfile;
  locale: Locale;
  calendarGap?: DiaryGap | null;
  daysSinceLastPost: number;
  request?: Request;
}): Promise<{ data: NudgeResult; source: "openrouter" | "local" }> {
  const { profile, locale, calendarGap, daysSinceLastPost, request } = opts;

  const local = (): NudgeResult => {
    const gapLabel = calendarGap
      ? formatOpenGapLabel(calendarGap, locale)
      : null;
    if (locale === "he") {
      return NudgeSchema.parse({
        headline: gapLabel
          ? `שלום ${profile.name.split(/\s+/)[0]}, יש חלון פנוי (${gapLabel}) ולא פרסמנו כבר ${daysSinceLastPost} ימים.`
          : `שלום ${profile.name.split(/\s+/)[0]}, לא פרסמנו כבר ${daysSinceLastPost} ימים — בואו נקליט עדכון של 20 שניות.`,
        cta: gapLabel ? "מלא חלון זה בפוסט" : "הקלטת פוסט מהירה",
        seedPrompt: gapLabel
          ? `פרסם הודעה על פתיחת חלון שירות: ${gapLabel}`
          : `עדכון עבודה קצר מ${profile.name} — ${profile.trade} באזור ${profile.location.city}.`,
        urgency:
          daysSinceLastPost >= 5 ? "high" : daysSinceLastPost >= 3 ? "medium" : "low",
      });
    }
    return NudgeSchema.parse({
      headline: gapLabel
        ? `Hi ${profile.name.split(/\s+/)[0]}, open slot (${gapLabel}) and ${daysSinceLastPost} days since last post.`
        : `Hi ${profile.name.split(/\s+/)[0]}, ${daysSinceLastPost} days without a post — let's record a 20s update.`,
      cta: gapLabel ? "Fill this slot with a post" : "Quick voice post",
      seedPrompt: gapLabel
        ? `Publish a notice about an open service window: ${gapLabel}`
        : `Short job update from ${profile.name} — ${profile.trade} in ${profile.location.city}.`,
      urgency:
        daysSinceLastPost >= 5 ? "high" : daysSinceLastPost >= 3 ? "medium" : "low",
    });
  };

  if (!hasOpenRouterKey()) {
    return { data: local(), source: "local" };
  }

  const system = buildSystemPrompt(profile, "proactive_nudge", locale);
  const user = `Calendar Gap: ${JSON.stringify(calendarGap ?? null)}
Days since last post: ${daysSinceLastPost}
Return JSON: { "headline", "cta", "seedPrompt", "urgency" }`;

  const remote = await openRouterStructured({
    system,
    user,
    schema: NudgeSchema,
    request,
  });

  if (!remote.ok) return { data: local(), source: "local" };
  return { data: remote.data, source: "openrouter" };
}

function captionsFromGeneration(
  gen: PostGeneration,
  accounts: ConnectedAccount[],
  userText: string,
): PostPayload["variants"] {
  const byPlatform: Record<string, string> = {
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

  return accounts.map((a) => ({
    platform: a.platform,
    connectedAccountId: a.id,
    caption: byPlatform[a.platform] || userText,
    hashtags:
      a.platform === "instagram" || a.platform === "facebook"
        ? undefined
        : undefined,
    mediaAssetIds: [],
    charLimit: PLATFORM_CHAR_LIMITS[a.platform],
  }));
}

/** Pipeline B — studio facts → 11 platform captions */
export async function runStudioPipeline(opts: {
  profile: BusinessProfile;
  locale: Locale;
  userInput: string;
  calendarGap?: unknown;
  enabledAccounts: ConnectedAccount[];
  request?: Request;
}): Promise<{
  data: {
    generation: PostGeneration;
    post: PostPayload;
    mode: "auto";
  };
  source: "openrouter" | "local";
}> {
  const { profile, locale, userInput, calendarGap, enabledAccounts, request } =
    opts;

  const gapObj =
    calendarGap && typeof calendarGap === "object"
      ? (calendarGap as Record<string, unknown>)
      : null;
  const seedGap =
    gapObj &&
    (typeof gapObj.gapId === "string" || typeof gapObj.id === "string") &&
    typeof gapObj.windowStart === "string" &&
    typeof gapObj.windowEnd === "string"
      ? {
          gapId: String(gapObj.gapId ?? gapObj.id),
          windowStart: String(gapObj.windowStart),
          windowEnd: String(gapObj.windowEnd),
        }
      : undefined;

  const localPost = generateGroundedPost({
    profile,
    locale,
    userInput: {
      promptText: userInput,
      seedGap,
    },
    enabledAccounts,
  });

  const localGen = (): PostGeneration => {
    const find = (p: string) =>
      localPost.variants.find((v) => v.platform === p)?.caption ?? userInput;
    return PostGenerationSchema.parse({
      whatsapp: find("whatsapp"),
      facebook: find("facebook"),
      instagram: find("instagram"),
      tiktok_reels_hook: find("tiktok"),
      youtube: find("youtube"),
      linkedin: find("linkedin"),
      x: find("x").slice(0, 280),
      threads: find("threads"),
      reddit: find("reddit"),
      google_business: find("google_business"),
      easy: find("easy"),
      extracted_facts: localPost.groundingRefs.slice(0, 8),
    });
  };

  if (!hasOpenRouterKey()) {
    const generation = localGen();
    return {
      data: { generation, post: localPost, mode: "auto" },
      source: "local",
    };
  }

  const system = buildSystemPrompt(profile, "studio_generate", locale);
  const user = `User Spoken/Written Input: "${userInput}"
Target Date/Context: ${calendarGap ? JSON.stringify(calendarGap) : "Standard post"}
Enabled platforms: ${enabledAccounts.map((a) => a.platform).join(", ")}
Return JSON matching PostGenerationSchema fields.`;

  const remote = await openRouterStructured({
    system,
    user,
    schema: PostGenerationSchema,
    request,
  });

  if (!remote.ok) {
    const generation = localGen();
    return {
      data: { generation, post: localPost, mode: "auto" },
      source: "local",
    };
  }

  const generation = remote.data;
  const variants = captionsFromGeneration(
    generation,
    enabledAccounts,
    userInput,
  );
  const post: PostPayload = {
    id: nanoid(),
    orgId: profile.orgId,
    businessId: profile.id,
    sourceCaptureId: nanoid(),
    groundingRefs: generation.extracted_facts.map(
      (f, i) => `agent_fact:${i}:${f}`,
    ),
    variants,
    publicationPlan: enabledAccounts.map((a) => ({
      connectedAccountId: a.id,
      mode: a.mode,
      status: "queued" as const,
    })),
  };

  return {
    data: { generation, post, mode: "auto" },
    source: "openrouter",
  };
}

/** Pipeline C — three review reply presets */
export async function runReviewPipeline(opts: {
  profile: BusinessProfile;
  locale: Locale;
  review: ReviewFeedItem;
  preset?: ReviewReplyPreset;
  request?: Request;
}): Promise<{
  data: {
    presets: ReviewPresets;
    draft: { preset: ReviewReplyPreset; text: string; groundingRefs: string[] };
  };
  source: "openrouter" | "local";
}> {
  const { profile, locale, review, preset = "warm_grateful", request } = opts;

  const localPresets = (): ReviewPresets => {
    const warm = generateReviewReply(profile, review, "warm_grateful", locale);
    const brief = generateReviewReply(
      profile,
      review,
      "professional_concise",
      locale,
    );
    const soft = generateReviewReply(
      profile,
      review,
      "deescalating_compromise",
      locale,
    );
    return ReviewPresetsSchema.parse({
      warm_grateful: warm.text,
      professional_concise: brief.text,
      deescalating_compromise: soft.text,
      grounding_notes: warm.groundingRefs,
    });
  };

  let presets: ReviewPresets;
  let source: "openrouter" | "local" = "local";

  if (hasOpenRouterKey()) {
    const system = buildSystemPrompt(profile, "review_reply", locale);
    const user = `Review Platform: ${review.source}
Rating: ${review.rating} stars
Author: ${review.authorName ?? "Customer"}
Text: "${review.text}"
Verified phone for private follow-up: ${isolatePhone(profile.phone)}
Return JSON: { "warm_grateful", "professional_concise", "deescalating_compromise", "grounding_notes": [] }`;

    const remote = await openRouterStructured({
      system,
      user,
      schema: ReviewPresetsSchema,
      request,
    });
    if (remote.ok) {
      presets = remote.data;
      source = "openrouter";
    } else {
      presets = localPresets();
    }
  } else {
    presets = localPresets();
  }

  const text = presets[preset];
  return {
    data: {
      presets,
      draft: {
        preset,
        text,
        groundingRefs: presets.grounding_notes,
      },
    },
    source,
  };
}

export { asProfile };
