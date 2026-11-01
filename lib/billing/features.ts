import type { PlanTier } from "@/lib/domain/types";

export type Feature =
  | "multi_location"
  | "proactive_gaps"
  | "media_upscale"
  | "reputation_hub"
  | "official_publish_quota_high"
  | "agency_digests";

const TIER_FEATURES: Record<PlanTier, Feature[]> = {
  solo: [],
  growth: [
    "proactive_gaps",
    "media_upscale",
    "reputation_hub",
    "official_publish_quota_high",
  ],
  agency: [
    "multi_location",
    "proactive_gaps",
    "media_upscale",
    "reputation_hub",
    "official_publish_quota_high",
    "agency_digests",
  ],
};

export function hasFeature(tier: PlanTier, feature: Feature): boolean {
  return TIER_FEATURES[tier].includes(feature);
}

export function assertFeature(tier: PlanTier, feature: Feature): void {
  if (!hasFeature(tier, feature)) {
    throw new Error(`Feature "${feature}" requires a higher plan than ${tier}`);
  }
}

export function maxBusinessProfiles(tier: PlanTier): number {
  if (tier === "solo") return 1;
  if (tier === "growth") return 3;
  return Number.POSITIVE_INFINITY;
}
