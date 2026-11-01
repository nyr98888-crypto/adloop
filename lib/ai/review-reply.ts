import type {
  BusinessProfile,
  Locale,
  ReviewFeedItem,
  ReviewReplyPreset,
} from "@/lib/domain/types";
import {
  ReviewReplyDraftSchema,
  type ReviewReplyDraft,
} from "@/lib/ai/schemas";
import { buildGroundingContext } from "@/lib/ai/grounding";
import { isolatePhone } from "@/lib/i18n/bidi";

const PRESET_COPY: Record<
  ReviewReplyPreset,
  { he: (p: BusinessProfile, r: ReviewFeedItem) => string; en: (p: BusinessProfile, r: ReviewFeedItem) => string }
> = {
  warm_grateful: {
    he: (p) =>
      `תודה רבה על המילים החמות! שמחנו לספק לכם שירות ${p.trade} מקצועי. נשמח לעמוד לשירותכם שוב — ${isolatePhone(p.phone)}`,
    en: (p) =>
      `Thank you for the kind words! We were glad to provide professional ${p.trade} service. We look forward to helping again — ${isolatePhone(p.phone)}`,
  },
  professional_concise: {
    he: (p) =>
      `תודה על המשוב. ${p.name} מעריכים את פנייתכם. לשאלות נוספות: ${isolatePhone(p.phone)}`,
    en: (p) =>
      `Thank you for your feedback. ${p.name} appreciates your review. For follow-up: ${isolatePhone(p.phone)}`,
  },
  deescalating_compromise: {
    he: (p) =>
      `מצטערים על החוויה. חשוב לנו לדייק ולסייע. נשמח לשיחה פרטית בטלפון ${isolatePhone(p.phone)} — בלי הודאה באחריות משפטית.`,
    en: (p) =>
      `We're sorry about the experience. We want to help. Please call ${isolatePhone(p.phone)} privately — without admitting legal fault.`,
  },
};

/**
 * Grounded 3-tier review reply — reinforces verified trade/phone only.
 * De-escalating preset invites private contact; never admits legal fault.
 */
export function generateReviewReply(
  profile: BusinessProfile,
  review: ReviewFeedItem,
  preset: ReviewReplyPreset,
  locale: Locale,
): ReviewReplyDraft {
  const ctx = buildGroundingContext(profile, {
    promptText: review.text,
  });
  const builder = PRESET_COPY[preset][locale === "en" ? "en" : "he"];
  const text = builder(profile, review);

  return ReviewReplyDraftSchema.parse({
    preset,
    text,
    groundingRefs: [
      `business_profile:trade:${profile.trade}`,
      `business_profile:phone:${profile.phone}`,
      `business_profile:name:${profile.name}`,
      `review:${review.id}`,
      ...ctx.anchors.immutableFacts.map((f) => `immutable:${f}`),
    ],
  });
}
