/**
 * Drizzle schema sketch — Neon Postgres.
 * Wire DATABASE_URL and run migrations when Neon is linked.
 */

export type OrgRow = {
  id: string;
  clerkOrgId: string;
  planTier: "solo" | "growth" | "agency";
  stripeCustomerId: string | null;
  timezone: string;
  createdAt: Date;
};

export type BusinessProfileRow = {
  id: string;
  orgId: string;
  name: string;
  trade: string;
  city: string;
  address: string | null;
  phone: string;
  workingHours: string | null;
  localeDefault: "he" | "en";
  toneOfVoice: string;
  standardCta: string;
  immutableFacts: string[];
  timezone: string;
};

export type ConnectedAccountRow = {
  id: string;
  orgId: string;
  businessId: string;
  platform: string;
  mode: "official_api" | "manual_deeplink";
  status: "active" | "degraded" | "disconnected";
  enabled: boolean;
  displayName: string;
  tokenRef: string | null;
  scopes: string[] | null;
  deepLinkTemplate: string | null;
  webComposerUrl: string | null;
};

export type PostRow = {
  id: string;
  orgId: string;
  businessId: string;
  sourceCaptureId: string;
  seedGapId: string | null;
  groundingRefs: string[];
  strippedClaims: string[];
  createdAt: Date;
};

export type PostVariantRow = {
  id: string;
  postId: string;
  platform: string;
  connectedAccountId: string;
  caption: string;
  hashtags: string[] | null;
  cta: string | null;
  mediaAssetIds: string[];
  charLimit: number;
  dirty: boolean;
};

export type PublicationJobRow = {
  id: string;
  postId: string;
  connectedAccountId: string;
  mode: "official_api" | "manual_deeplink";
  status: "queued" | "published" | "awaiting_manual" | "failed";
  remotePostId: string | null;
};

export type DiaryGapRow = {
  id: string;
  businessId: string;
  windowStart: Date;
  windowEnd: Date;
  reason: string;
  status: "open" | "acted" | "dismissed";
};

export type ReviewRow = {
  id: string;
  orgId: string;
  businessId: string;
  source: "google" | "easy";
  externalId: string;
  rating: number;
  text: string;
  authorName: string | null;
  createdAt: Date;
  provenanceMethod: "api" | "manual_import" | "public_page";
  fetchedAt: Date;
};

/** SQL DDL reference for Neon bootstrap */
export const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  clerk_org_id TEXT UNIQUE NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'solo',
  stripe_customer_id TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT NOT NULL,
  working_hours TEXT,
  locale_default TEXT NOT NULL DEFAULT 'he',
  tone_of_voice TEXT NOT NULL,
  standard_cta TEXT NOT NULL,
  immutable_facts JSONB NOT NULL DEFAULT '[]',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem'
);

CREATE TABLE IF NOT EXISTS connected_accounts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  display_name TEXT NOT NULL,
  token_ref TEXT,
  scopes JSONB,
  deep_link_template TEXT,
  web_composer_url TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  source_capture_id TEXT NOT NULL,
  seed_gap_id TEXT,
  grounding_refs JSONB NOT NULL DEFAULT '[]',
  stripped_claims JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_variants (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id),
  platform TEXT NOT NULL,
  connected_account_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags JSONB,
  cta TEXT,
  media_asset_ids JSONB NOT NULL DEFAULT '[]',
  char_limit INT NOT NULL,
  dirty BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS publication_jobs (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  connected_account_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  remote_post_id TEXT
);
`;
