import { generateGroundedPost } from "@/lib/ai/pipeline";
import { generateReviewReply } from "@/lib/ai/review-reply";
import type {
  BusinessProfile,
  ConnectedAccount,
  DiaryGap,
  EngagementPulse,
  Locale,
  PostPayload,
  ReviewFeedItem,
  ReviewReplyPreset,
  UserInputPayload,
} from "@/lib/domain/types";

/**
 * Social Worker tool surface — all copy goes through lib/ai grounding.
 * Vocabulary: Post / פוסט — never "campaign".
 */
export const socialWorkerTools = {
  getBusinessProfile(profile: BusinessProfile) {
    return profile;
  },

  getCalendarGaps(gaps: DiaryGap[]) {
    return gaps.filter((g) => g.status === "open");
  },

  getReputationDigest(reviews: ReviewFeedItem[]) {
    const avg =
      reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1);
    return {
      count: reviews.length,
      average: Math.round(avg * 10) / 10,
      samples: reviews.slice(0, 5).map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text.slice(0, 160),
        source: r.source,
      })),
    };
  },

  getEngagementSnapshot(pulse: EngagementPulse) {
    return pulse;
  },

  draftPostVariants(input: {
    profile: BusinessProfile;
    userInput: UserInputPayload;
    accounts: ConnectedAccount[];
    locale: Locale;
  }): PostPayload {
    return generateGroundedPost({
      profile: input.profile,
      userInput: input.userInput,
      enabledAccounts: input.accounts,
      locale: input.locale,
    });
  },

  draftReviewReply(input: {
    profile: BusinessProfile;
    review: ReviewFeedItem;
    preset: ReviewReplyPreset;
    locale: Locale;
  }) {
    return generateReviewReply(
      input.profile,
      input.review,
      input.preset,
      input.locale,
    );
  },

  /** Queues a Post publication — never posts raw chat text */
  requestPublish(post: PostPayload) {
    return {
      ok: true,
      publicationId: post.id,
      message: "Post queued for publication",
      plan: post.publicationPlan,
    };
  },
};

export function buildAgentSystemPrompt(locale: Locale): string {
  if (locale === "he") {
    return `אתה Social Worker — עוזר שיווק לעסקים קטנים בישראל.
צור רק טיוטות פוסט (פוסט / פרסום) דרך כלי ה-grounding.
אסור להמציא מחירים, הנחות, אחריות, לקוחות או תעודות שלא הופיעו בקלט או בפרופיל המאומת.
לעולם אל תשתמש במילה campaign.`;
  }
  return `You are the Social Worker — a marketing companion for local small businesses.
Only create Post / Publication drafts via grounded tools.
Never invent prices, discounts, warranties, clients, or certifications not in user input or verified profile.
Never use the word "campaign".`;
}
