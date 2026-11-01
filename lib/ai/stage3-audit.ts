import {
  AuditResultSchema,
  type AuditResult,
  type ChannelDrafts,
  type ExtractedFacts,
} from "@/lib/ai/schemas";
import {
  stripUngroundedSentences,
  type GroundingContext,
} from "@/lib/ai/grounding";
import { isolatePhone } from "@/lib/i18n/bidi";

/**
 * Stage 3: Self-Audit & Fact-Check Pass.
 * Strip ungrounded claims; never rewrite with new speculation.
 */
export function auditAndVerify(
  drafts: ChannelDrafts,
  facts: ExtractedFacts,
  ctx: GroundingContext,
): AuditResult {
  const strippedClaims: string[] = [...facts.discardedAssumptions];
  const groundingRefs = facts.explicitClaims.map(
    (c) => `${c.source}:${c.field ?? "claim"}:${c.text.slice(0, 80)}`,
  );

  const variants = drafts.drafts.map((draft) => {
    const { text, stripped } = stripUngroundedSentences(draft.caption, ctx);
    strippedClaims.push(...stripped);

    // Ensure phone / name remain if stripped emptied the caption
    const caption =
      text ||
      [ctx.anchors.name, ctx.anchors.trade, ctx.anchors.phone]
        .filter(Boolean)
        .join(" · ");

    return {
      platform: draft.platform,
      connectedAccountId: draft.connectedAccountId,
      caption,
      hashtags: draft.hashtags,
      cta: draft.cta,
      mediaAssetIds: [] as string[],
      charLimit: draft.charLimit,
    };
  });

  let whatsappCard = drafts.whatsappCard;
  if (whatsappCard) {
    const cleanedBullets: string[] = [];
    for (const b of whatsappCard.bullets) {
      const { text, stripped } = stripUngroundedSentences(b, ctx);
      strippedClaims.push(...stripped);
      if (text) cleanedBullets.push(text);
    }
    whatsappCard = {
      ...whatsappCard,
      bullets: cleanedBullets.length
        ? cleanedBullets
        : [ctx.anchors.trade, ctx.anchors.phone].filter(Boolean),
      contactCta: `${ctx.anchors.standardCta} ${isolatePhone(ctx.anchors.phone)}`.trim(),
    };
  }

  return AuditResultSchema.parse({
    variants,
    whatsappCard,
    groundingRefs,
    strippedClaims: Array.from(new Set(strippedClaims)),
  });
}
