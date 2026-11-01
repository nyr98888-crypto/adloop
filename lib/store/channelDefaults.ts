import type { BusinessProfile, ConnectedAccount } from "@/lib/domain/types";
import { SOCIAL_NETWORKS } from "@/types/social";
import {
  DEMO_BUSINESS_ID,
  DEMO_ORG_ID,
  demoProfile,
} from "@/lib/demo/store";

const defaultEnabled = new Set([
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
]);

export function buildDefaultAccounts(
  businessId: string = DEMO_BUSINESS_ID,
  orgId: string = DEMO_ORG_ID,
): ConnectedAccount[] {
  return SOCIAL_NETWORKS.map((net) => ({
    id: `acc_${businessId}_${net.id}`,
    orgId,
    businessId,
    platform: net.id,
    mode: net.defaultMode,
    status: defaultEnabled.has(net.id) ? ("active" as const) : ("disconnected" as const),
    enabled: defaultEnabled.has(net.id),
    displayName: net.nameEn,
    scopes:
      net.supportsOfficialApi && net.defaultMode === "official_api"
        ? ["publish"]
        : undefined,
    deepLinkTemplate:
      net.id === "whatsapp" ? "whatsapp://send?text={text}" : undefined,
    webComposerUrl:
      net.id === "whatsapp"
        ? "https://web.whatsapp.com/"
        : net.id === "instagram"
          ? "https://www.instagram.com/"
          : undefined,
  }));
}

export function createEmptyBusiness(
  partial: Pick<BusinessProfile, "name" | "trade" | "phone"> &
    Partial<BusinessProfile>,
): BusinessProfile {
  const id = `biz_${Date.now().toString(36)}`;
  return {
    id,
    orgId: DEMO_ORG_ID,
    name: partial.name,
    trade: partial.trade,
    location: partial.location ?? { city: "", region: "" },
    phone: partial.phone,
    websiteUrl: partial.websiteUrl,
    workingHours: partial.workingHours ?? "א׳–ה׳ 08:00–18:00",
    localeDefault: partial.localeDefault ?? "he",
    toneOfVoice: partial.toneOfVoice ?? "ידידותי, ישיר, מקצועי",
    standardCta: partial.standardCta ?? "להזמנה חייגו",
    immutableFacts: partial.immutableFacts ?? [],
    timezone: partial.timezone ?? "Asia/Jerusalem",
  };
}

export const demoSecondaryProfile: BusinessProfile = {
  id: "biz_demo_cafe",
  orgId: DEMO_ORG_ID,
  name: "קפה הבוקר",
  trade: "בית קפה",
  location: { city: "הרצליה", address: "סוקולוב 8", region: "השרון" },
  phone: "052-9876543",
  websiteUrl: "https://morning-cafe.example.co.il",
  workingHours: "א׳–ו׳ 07:00–16:00",
  localeDefault: "he",
  toneOfVoice: "חם, קליל, מזמין",
  standardCta: "הזמינו שולחן",
  immutableFacts: ["קפה טרי כל בוקר", "חלבי וטבעוני"],
  timezone: "Asia/Jerusalem",
};

export function defaultBusinesses(): BusinessProfile[] {
  return [
    {
      ...demoProfile,
      websiteUrl: demoProfile.websiteUrl ?? "https://nir-plumbing.example.co.il",
    },
    demoSecondaryProfile,
  ];
}

export const CHANNEL_STORAGE_KEY = "ols_channels_by_biz_v2";
export const BUSINESS_STORAGE_KEY = "ols_businesses_v2";
export const ACTIVE_BUSINESS_KEY = "ols_active_business_v2";
/** Legacy single-profile keys (migrated once) */
export const LEGACY_CHANNEL_KEY = "ols_channels_v1";
export const LEGACY_BUSINESS_KEY = "ols_business_v1";
