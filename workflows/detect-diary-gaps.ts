import type { DiaryGap, PlanTier } from "@/lib/domain/types";
import { hasFeature } from "@/lib/billing/features";
import { socialWorkerTools } from "@/lib/agent/social-worker";
import {
  demoAccounts,
  demoProfile,
} from "@/lib/demo/store";

/**
 * Proactive gap detection — Growth+ feature.
 * Creates grounded Post draft suggestions for open windows.
 */
export function detectDiaryGapsWorkflow(input: {
  gaps: DiaryGap[];
  tier: PlanTier;
  locale: "he" | "en";
}) {
  if (!hasFeature(input.tier, "proactive_gaps")) {
    return { prompts: [], drafts: [] };
  }

  const open = socialWorkerTools.getCalendarGaps(input.gaps);
  const prompts = open.map((gap) => ({
    gapId: gap.id,
    title:
      input.locale === "he"
        ? "חלון פנוי ביומן — למלא בפוסט?"
        : "Open diary slot — fill with a post?",
    windowStart: gap.windowStart,
    windowEnd: gap.windowEnd,
  }));

  const drafts = open.map((gap) =>
    socialWorkerTools.draftPostVariants({
      profile: demoProfile,
      accounts: demoAccounts,
      locale: input.locale,
      userInput: {
        promptText:
          input.locale === "he"
            ? "יש לנו חלון פנוי לקבלת לקוחות. מוזמנים לתאם."
            : "We have an open slot for customers. Welcome to book.",
        seedGap: {
          gapId: gap.id,
          windowStart: gap.windowStart,
          windowEnd: gap.windowEnd,
        },
      },
    }),
  );

  return { prompts, drafts };
}
