import type { SocialPlatformId } from "@/types/social";

export type Locale = "he" | "en";
export type PlanTier = "solo" | "growth" | "agency";
export type ConnectionMode = "official_api" | "manual_deeplink";
export type ConnectionStatus = "active" | "degraded" | "disconnected";

/** Aligns with types/social.ts catalog */
export type Platform = SocialPlatformId;

export type ReviewReplyPreset =
  | "warm_grateful"
  | "professional_concise"
  | "deescalating_compromise";

export interface BusinessProfile {
  id: string;
  orgId: string;
  name: string;
  trade: string;
  location: { city: string; address?: string; region?: string };
  phone: string;
  /** Optional verified website — preferred CTA for LinkedIn / Facebook / GBP */
  websiteUrl?: string;
  workingHours?: string;
  localeDefault: Locale;
  toneOfVoice: string;
  standardCta: string;
  pricingBounds?: {
    currency: "ILS";
    min?: number;
    max?: number;
    notes?: string;
  };
  immutableFacts: string[];
  timezone: string;
}

export interface ConnectedAccount {
  id: string;
  orgId: string;
  businessId: string;
  platform: Platform;
  mode: ConnectionMode;
  status: ConnectionStatus;
  enabled: boolean;
  displayName: string;
  tokenRef?: string;
  scopes?: string[];
  deepLinkTemplate?: string;
  webComposerUrl?: string;
}

export interface DiaryEvent {
  id: string;
  orgId: string;
  businessId: string;
  source: "google" | "apple_ics" | "apple_caldav" | "manual";
  externalId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  isBusy: boolean;
  syncedAt: string;
}

export interface DiaryGap {
  id: string;
  businessId: string;
  windowStart: string;
  windowEnd: string;
  reason: "empty_afternoon" | "no_bookings" | "low_posting_streak";
  suggestedOfferDraftId?: string;
  status: "open" | "acted" | "dismissed";
}

export interface ReviewFeedItem {
  id: string;
  orgId: string;
  businessId: string;
  source: "google" | "easy";
  externalId: string;
  rating: number;
  text: string;
  authorName?: string;
  createdAt: string;
  reply?: {
    text: string;
    preset?: ReviewReplyPreset;
    publishedAt?: string;
    status: "draft" | "published";
  };
  provenance: {
    method: "api" | "manual_import" | "public_page";
    fetchedAt: string;
  };
}

/** One Post (פוסט) — never named Campaign */
export interface PostPayload {
  id: string;
  orgId: string;
  businessId: string;
  sourceCaptureId: string;
  seedGapId?: string;
  groundingRefs: string[];
  strippedClaims?: string[];
  variants: Array<{
    platform: Platform;
    connectedAccountId: string;
    caption: string;
    hashtags?: string[];
    cta?: string;
    mediaAssetIds: string[];
    charLimit: number;
    dirty?: boolean;
  }>;
  whatsappCard?: {
    bullets: string[];
    emphasis: string;
    contactCta: string;
  };
  publicationPlan: Array<{
    connectedAccountId: string;
    mode: ConnectionMode;
    status: "queued" | "published" | "awaiting_manual" | "failed";
    remotePostId?: string;
  }>;
}

export type ContentFormatFilter = "all" | "video" | "feed";

export interface NetworkEngagement {
  platform: Platform;
  likes: number;
  comments: number;
  shares: number;
  whatsappLinkClicks?: number;
  reviewsCount?: number;
  /** Short-form video metrics */
  videoPlays?: number;
  watchTimeSec?: number;
  videoShares?: number;
  contentKind?: "video" | "feed" | "mixed";
}

export interface EngagementPulse {
  topPostOfWeek: {
    postId: string;
    platform: Platform;
    captionSnippet: string;
    imageUrl?: string;
    score: number;
    reach: number;
  } | null;
  perNetworkReactions: NetworkEngagement[];
  whatsappDirectLinkClicks: number;
  unifiedRatingIndex: {
    googleAvg: number | null;
    easyAvg: number | null;
    combined: number | null;
    googleCount?: number;
    easyCount?: number;
  };
}

export interface UserInputPayload {
  transcription?: string;
  promptText?: string;
  seedGap?: {
    gapId: string;
    windowStart: string;
    windowEnd: string;
  };
}

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  x: 280,
  tiktok: 2200,
  youtube: 5000,
  google_business: 1500,
  whatsapp: 4096,
  threads: 500,
  reddit: 40000,
  easy: 2000,
};

export const PLATFORM_LABELS: Record<Platform, { en: string; he: string }> = {
  facebook: { en: "Facebook", he: "פייסבוק" },
  instagram: { en: "Instagram", he: "אינסטגרם" },
  linkedin: { en: "LinkedIn", he: "לינקדאין" },
  x: { en: "X", he: "X" },
  tiktok: { en: "TikTok", he: "טיקטוק" },
  youtube: { en: "YouTube", he: "יוטיוב" },
  google_business: { en: "Google Business", he: "גוגל לעסק" },
  whatsapp: { en: "WhatsApp", he: "וואטסאפ" },
  threads: { en: "Threads", he: "Threads" },
  reddit: { en: "Reddit", he: "רדיט" },
  easy: { en: "Easy.co.il", he: "איזי" },
};
