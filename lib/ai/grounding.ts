import type { BusinessProfile, UserInputPayload } from "@/lib/domain/types";

export interface GroundingContext {
  anchors: {
    name: string;
    phone: string;
    location: string;
    trade: string;
    workingHours?: string;
    standardCta: string;
    immutableFacts: string[];
  };
  userText: string;
  allowList: string[];
  prohibitions: string[];
}

const HALLUCINATION_PATTERNS: RegExp[] = [
  /\b\d+\s*%\s*(off|הנחה|הנחת)\b/i,
  /\b(warranty|אחריות)\b/i,
  /\b(guarantee|מבטיחים|מבטיח)\b/i,
  /\b(award|תעודה|תעודת|certification|ISO)\b/i,
  /\b(testimonial|המלצת לקוח|client said)\b/i,
  /\b(best in|הכי טובים|מס'?\s*\d+)\b/i,
];

export function buildGroundingContext(
  profile: BusinessProfile,
  userInput: UserInputPayload,
): GroundingContext {
  const location = [
    profile.location.address,
    profile.location.city,
    profile.location.region,
  ]
    .filter(Boolean)
    .join(", ");

  const userText = [
    userInput.transcription?.trim(),
    userInput.promptText?.trim(),
    userInput.seedGap
      ? `Availability window: ${userInput.seedGap.windowStart} – ${userInput.seedGap.windowEnd}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const allowList = [
    profile.name,
    profile.phone,
    location,
    profile.trade,
    profile.workingHours ?? "",
    profile.standardCta,
    ...profile.immutableFacts,
    userText,
  ].filter(Boolean);

  return {
    anchors: {
      name: profile.name,
      phone: profile.phone,
      location,
      trade: profile.trade,
      workingHours: profile.workingHours,
      standardCta: profile.standardCta,
      immutableFacts: profile.immutableFacts,
    },
    userText,
    allowList,
    prohibitions: [
      "Never invent pricing, percentage discounts, warranties, or time guarantees unless explicitly in user input.",
      "Never invent past client names, awards, unverified certifications, or fake testimonials.",
      "Never speculate on dates, addresses, or operational capabilities outside verified profile + user input.",
    ],
  };
}

export function isClaimGrounded(
  claim: string,
  context: GroundingContext,
): boolean {
  const normalized = claim.trim();
  if (!normalized) return true;

  for (const pattern of HALLUCINATION_PATTERNS) {
    if (pattern.test(normalized) && !appearsInUserOrProfile(normalized, context)) {
      return false;
    }
  }

  // Discount / price numbers must appear in user text
  const moneyish = normalized.match(
    /(\d+\s*%|\d+\s*₪|₪\s*\d+|ILS\s*\d+|שקל|הנחה)/i,
  );
  if (moneyish && !context.userText.includes(moneyish[0].replace(/\s+/g, ""))) {
    const inUser = context.userText
      .toLowerCase()
      .includes(moneyish[0].toLowerCase());
    if (!inUser) return false;
  }

  return true;
}

function appearsInUserOrProfile(
  claim: string,
  context: GroundingContext,
): boolean {
  const lower = claim.toLowerCase();
  return context.allowList.some((a) => a.toLowerCase().includes(lower) || lower.includes(a.toLowerCase()));
}

export function stripUngroundedSentences(
  text: string,
  context: GroundingContext,
): { text: string; stripped: string[] } {
  const parts = text.split(/(?<=[.!?。\n])/);
  const kept: string[] = [];
  const stripped: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (isClaimGrounded(trimmed, context)) {
      kept.push(part);
    } else {
      stripped.push(trimmed);
    }
  }

  return { text: kept.join("").trim(), stripped };
}
