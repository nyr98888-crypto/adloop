import type { BusinessProfile, UserInputPayload } from "@/lib/domain/types";
import {
  ExtractedFactsSchema,
  type ExtractedFacts,
} from "@/lib/ai/schemas";
import { buildGroundingContext } from "@/lib/ai/grounding";

/**
 * Stage 1: Extraction & Entity Verification.
 * Deterministic parser — only explicit facts; assumptions discarded.
 * (Optional LLM enrichment can wrap this later via structured outputs.)
 */
export function extractFacts(
  profile: BusinessProfile,
  userInput: UserInputPayload,
): ExtractedFacts {
  const ctx = buildGroundingContext(profile, userInput);
  const text = ctx.userText;

  const explicitClaims: ExtractedFacts["explicitClaims"] = [
    { text: profile.name, source: "business_profile", field: "name" },
    { text: profile.phone, source: "business_profile", field: "phone" },
    { text: profile.trade, source: "business_profile", field: "trade" },
    {
      text: ctx.anchors.location,
      source: "business_profile",
      field: "location",
    },
  ];

  if (profile.workingHours) {
    explicitClaims.push({
      text: profile.workingHours,
      source: "business_profile",
      field: "workingHours",
    });
  }

  if (text) {
    explicitClaims.push({
      text: text.slice(0, 500),
      source: "user_input",
      field: "raw",
    });
  }

  const materials: string[] = [];
  const materialHints = text.match(
    /(?:עם|using|with)\s+([^\n,.!?]+)/gi,
  );
  if (materialHints) {
    for (const m of materialHints) {
      materials.push(m.replace(/^(?:עם|using|with)\s+/i, "").trim());
    }
  }

  const priceMatch = text.match(
    /(\d+\s*%[^\n]*|₪\s*\d+|\d+\s*₪|הנחה[^\n]*)/i,
  );
  const timeframeMatch = text.match(
    /(היום|מחר|השבוע|today|tomorrow|this week|תוך\s+\d+\s+שעות)/i,
  );

  const discardedAssumptions: string[] = [];
  if (!priceMatch) {
    discardedAssumptions.push("No price/discount stated — will not invent one.");
  }
  if (!timeframeMatch) {
    discardedAssumptions.push(
      "No timeframe guarantee stated — will not invent one.",
    );
  }

  const missingFields: string[] = [];
  if (!text.trim()) missingFields.push("user_input");
  if (!profile.phone) missingFields.push("phone");

  const result = {
    servicePerformed: text.trim()
      ? text.trim().split(/[.!\n]/)[0]?.slice(0, 200) || null
      : null,
    locationMention: ctx.anchors.location || null,
    materials,
    statedTimeframe: timeframeMatch?.[0] ?? null,
    statedPriceOrDiscount: priceMatch?.[0] ?? null,
    availabilityWindow: userInput.seedGap
      ? {
          windowStart: userInput.seedGap.windowStart,
          windowEnd: userInput.seedGap.windowEnd,
        }
      : null,
    explicitClaims,
    missingFields,
    discardedAssumptions,
  };

  return ExtractedFactsSchema.parse(result);
}
