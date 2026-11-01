import { z } from "zod";

export const ExplicitClaimSchema = z.object({
  text: stringClaim(),
  source: z.enum(["user_input", "business_profile"]),
  field: z.string().optional(),
});

function stringClaim() {
  return z.string().min(1);
}

export const ExtractedFactsSchema = z.object({
  servicePerformed: z.string().nullable(),
  locationMention: z.string().nullable(),
  materials: z.array(z.string()).default([]),
  statedTimeframe: z.string().nullable(),
  statedPriceOrDiscount: z.string().nullable(),
  availabilityWindow: z
    .object({
      windowStart: z.string(),
      windowEnd: z.string(),
    })
    .nullable()
    .optional(),
  explicitClaims: z.array(ExplicitClaimSchema),
  missingFields: z.array(z.string()).default([]),
  discardedAssumptions: z.array(z.string()).default([]),
});

export type ExtractedFacts = z.infer<typeof ExtractedFactsSchema>;

export const ChannelDraftSchema = z.object({
  platform: z.enum([
    "facebook",
    "instagram",
    "linkedin",
    "x",
    "tiktok",
    "youtube",
    "google_business",
    "whatsapp",
    "threads",
    "reddit",
    "easy",
  ]),
  connectedAccountId: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()).optional(),
  cta: z.string().optional(),
  charLimit: z.number(),
});

export const ChannelDraftsSchema = z.object({
  drafts: z.array(ChannelDraftSchema),
  whatsappCard: z
    .object({
      bullets: z.array(z.string()),
      emphasis: z.string(),
      contactCta: z.string(),
    })
    .optional(),
});

export type ChannelDrafts = z.infer<typeof ChannelDraftsSchema>;

export const AuditResultSchema = z.object({
  variants: z.array(
    z.object({
      platform: ChannelDraftSchema.shape.platform,
      connectedAccountId: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()).optional(),
      cta: z.string().optional(),
      mediaAssetIds: z.array(z.string()).default([]),
      charLimit: z.number(),
    }),
  ),
  whatsappCard: ChannelDraftsSchema.shape.whatsappCard,
  groundingRefs: z.array(z.string()),
  strippedClaims: z.array(z.string()).default([]),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

export const ReviewReplyDraftSchema = z.object({
  preset: z.enum([
    "warm_grateful",
    "professional_concise",
    "deescalating_compromise",
  ]),
  text: z.string(),
  groundingRefs: z.array(z.string()),
});

export type ReviewReplyDraft = z.infer<typeof ReviewReplyDraftSchema>;
