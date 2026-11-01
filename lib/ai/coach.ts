import type { ExtractedFacts } from "@/lib/ai/schemas";
import type { Locale } from "@/lib/domain/types";

export type AiMode = "auto" | "coached";

/**
 * Sparse input → Coached Mode (1–2 grounding questions).
 * Sufficient detail → Auto Mode.
 */
export function resolveAiMode(facts: ExtractedFacts, rawText: string): AiMode {
  const words = rawText.trim().split(/\s+/).filter(Boolean).length;
  const hasService = Boolean(facts.servicePerformed && facts.servicePerformed.length > 12);
  const hasPlace = Boolean(facts.locationMention);
  if (words >= 12 && hasService) return "auto";
  if (words >= 8 && hasService && hasPlace) return "auto";
  return "coached";
}

export function coachingQuestions(
  facts: ExtractedFacts,
  locale: Locale,
): string[] {
  const qs: string[] = [];
  if (!facts.locationMention || facts.missingFields.includes("location")) {
    qs.push(
      locale === "he"
        ? "באיזה שכונה / עיר בוצעה העבודה?"
        : "Which neighborhood / city was the job in?",
    );
  }
  if (!facts.statedTimeframe) {
    qs.push(
      locale === "he"
        ? "האם זה היה קריאת חירום או שירות רגיל?"
        : "Was this an emergency call or a standard service?",
    );
  }
  if (qs.length === 0) {
    qs.push(
      locale === "he"
        ? "יש פרט חשוב נוסף שכדאי לכלול בפוסט?"
        : "Any important detail we should include in the post?",
    );
  }
  return qs.slice(0, 2);
}
