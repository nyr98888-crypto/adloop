import { z } from "zod";

export const AgentModeSchema = z.enum([
  "proactive_nudge",
  "studio_generate",
  "review_reply",
]);

export type AgentMode = z.infer<typeof AgentModeSchema>;

/** Pipeline B — Studio: multi-platform structured captions */
export const PostGenerationSchema = z.object({
  whatsapp: z
    .string()
    .describe(
      "Bulleted, formatted with emojis, phone link, and direct CTA",
    ),
  facebook: z
    .string()
    .describe("Engaging story hook, service details, 3 hashtags"),
  instagram: z
    .string()
    .describe("Visual caption, concise hook, relevant local hashtags"),
  tiktok_reels_hook: z
    .string()
    .describe("Spoken video hook for the first 3 seconds"),
  youtube: z
    .string()
    .describe("Shorts-friendly caption with hook + CTA")
    .optional(),
  linkedin: z
    .string()
    .describe(
      "Professional update focusing on quality, materials, or trade insight",
    ),
  x: z.string().max(280).describe("Concise update under 280 characters"),
  threads: z.string().optional(),
  reddit: z.string().optional(),
  google_business: z.string().optional(),
  easy: z.string().optional(),
  extracted_facts: z
    .array(z.string())
    .describe("List of verified facts extracted from user input"),
});

export type PostGeneration = z.infer<typeof PostGenerationSchema>;

/** Pipeline A — Nudge: dead-zone / calendar gap CTA */
export const NudgeSchema = z.object({
  headline: z.string().describe("One-line Social Worker alert"),
  cta: z.string().describe("Short CTA for the Home dead-zone button"),
  seedPrompt: z
    .string()
    .describe("Pre-filled studio prompt for filling the gap"),
  urgency: z.enum(["low", "medium", "high"]),
});

export type NudgeResult = z.infer<typeof NudgeSchema>;

/** Pipeline C — Reviews: three grounded presets */
export const ReviewPresetsSchema = z.object({
  warm_grateful: z.string(),
  professional_concise: z.string(),
  deescalating_compromise: z.string(),
  grounding_notes: z.array(z.string()).default([]),
});

export type ReviewPresets = z.infer<typeof ReviewPresetsSchema>;

export const AgentRequestSchema = z.object({
  mode: AgentModeSchema,
  businessProfile: z.record(z.string(), z.unknown()).optional(),
  userInput: z.unknown().optional(),
  calendarGap: z.unknown().optional(),
  reviewItem: z.unknown().optional(),
  locale: z.enum(["he", "en"]).optional(),
  enabledPlatforms: z.array(z.string()).optional(),
  preset: z
    .enum([
      "warm_grateful",
      "professional_concise",
      "deescalating_compromise",
    ])
    .optional(),
});
