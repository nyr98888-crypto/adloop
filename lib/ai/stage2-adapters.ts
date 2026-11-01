import type {
  BusinessProfile,
  ConnectedAccount,
  Locale,
  Platform,
} from "@/lib/domain/types";
import { PLATFORM_CHAR_LIMITS } from "@/lib/domain/types";
import type { ExtractedFacts } from "@/lib/ai/schemas";
import {
  ChannelDraftsSchema,
  type ChannelDrafts,
} from "@/lib/ai/schemas";
import type { GroundingContext } from "@/lib/ai/grounding";
import { isolateHashtags, isolatePhone } from "@/lib/i18n/bidi";
import { ctaForPlatform } from "@/lib/publishing/cta";

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

function hashtagsFromFacts(facts: ExtractedFacts, trade: string): string[] {
  const tags = new Set<string>();
  const tradeTag = trade.replace(/\s+/g, "");
  if (tradeTag) tags.add(`#${tradeTag}`);
  if (facts.locationMention) {
    const city = facts.locationMention.split(",")[0]?.replace(/\s+/g, "");
    if (city) tags.add(`#${city}`);
  }
  return isolateHashtags(Array.from(tags).slice(0, 5));
}

function buildWhatsApp(
  profile: BusinessProfile,
  facts: ExtractedFacts,
  locale: Locale,
): ChannelDrafts["whatsappCard"] {
  const bullets = [
    facts.servicePerformed ||
      (locale === "he"
        ? `שירות ${profile.trade} מקצועי`
        : `Professional ${profile.trade} service`),
    facts.locationMention
      ? locale === "he"
        ? `מיקום: ${facts.locationMention}`
        : `Location: ${facts.locationMention}`
      : null,
    facts.statedPriceOrDiscount
      ? locale === "he"
        ? `פרטים: ${facts.statedPriceOrDiscount}`
        : `Details: ${facts.statedPriceOrDiscount}`
      : null,
    facts.availabilityWindow
      ? locale === "he"
        ? `חלון פנוי: ${new Date(facts.availabilityWindow.windowStart).toLocaleString("he-IL")} – ${new Date(facts.availabilityWindow.windowEnd).toLocaleString("he-IL")}`
        : `Open slot: ${facts.availabilityWindow.windowStart} – ${facts.availabilityWindow.windowEnd}`
      : null,
  ].filter(Boolean) as string[];

  return {
    bullets,
    emphasis:
      locale === "he"
        ? `${profile.name} · ${profile.trade}`
        : `${profile.name} · ${profile.trade}`,
    contactCta: ctaForPlatform("whatsapp", profile),
  };
}

function captionFor(
  platform: Platform,
  profile: BusinessProfile,
  facts: ExtractedFacts,
  locale: Locale,
  ctx: GroundingContext,
): { caption: string; hashtags?: string[]; cta?: string } {
  const service =
    facts.servicePerformed ||
    (locale === "he"
      ? `עדכון מ${profile.name}`
      : `Update from ${profile.name}`);

  const cta = ctaForPlatform(platform, profile);

  if (platform === "whatsapp") {
    const card = buildWhatsApp(profile, facts, locale)!;
    const caption = [
      card.emphasis,
      ...card.bullets.map((b) => `• ${b}`),
      card.contactCta,
    ].join("\n");
    return { caption, cta: card.contactCta };
  }

  if (platform === "tiktok" || platform === "youtube") {
    const hook = `🎬 ${service}`;
    return {
      caption: truncate(
        `${hook}\n${profile.trade} · ${ctx.anchors.location}\n${cta}`,
        PLATFORM_CHAR_LIMITS[platform],
      ),
      hashtags: hashtagsFromFacts(facts, profile.trade),
      cta,
    };
  }

  if (platform === "x" || platform === "threads") {
    return {
      caption: truncate(
        `${service}\n${profile.name} | ${isolatePhone(profile.phone)}`,
        PLATFORM_CHAR_LIMITS[platform],
      ),
      hashtags: hashtagsFromFacts(facts, profile.trade).slice(0, 2),
      cta,
    };
  }

  // FB / IG / LinkedIn / Google Business default
  const hook = `✨ ${service}`;
  const body = [
    hook,
    facts.statedPriceOrDiscount ?? null,
    facts.availabilityWindow
      ? locale === "he"
        ? "יש לנו חלון פנוי — דברו אלינו."
        : "We have an open slot — get in touch."
      : null,
    `${profile.trade} · ${ctx.anchors.location}`,
    cta,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    caption: truncate(body, PLATFORM_CHAR_LIMITS[platform]),
    hashtags: hashtagsFromFacts(facts, profile.trade),
    cta,
  };
}

/**
 * Stage 2: Deterministic Channel Adapters.
 * Layout matrix only — no invented facts beyond Stage 1 + profile anchors.
 */
export function adaptToChannels(
  profile: BusinessProfile,
  facts: ExtractedFacts,
  accounts: ConnectedAccount[],
  locale: Locale,
  ctx: GroundingContext,
): ChannelDrafts {
  const enabled = accounts.filter(
    (a) => a.enabled && a.status !== "disconnected",
  );

  const drafts = enabled.map((account) => {
    const built = captionFor(
      account.platform,
      profile,
      facts,
      locale,
      ctx,
    );
    return {
      platform: account.platform,
      connectedAccountId: account.id,
      caption: built.caption,
      hashtags: built.hashtags,
      cta: built.cta,
      charLimit: PLATFORM_CHAR_LIMITS[account.platform],
    };
  });

  const whatsappAccount = enabled.find((a) => a.platform === "whatsapp");
  const result = {
    drafts,
    whatsappCard: whatsappAccount
      ? buildWhatsApp(profile, facts, locale)
      : undefined,
  };

  return ChannelDraftsSchema.parse(result);
}
