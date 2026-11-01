import type { BusinessProfile, Platform } from "@/lib/domain/types";
import { isolatePhone, isolateUrl } from "@/lib/i18n/bidi";

/**
 * Contextual CTA routing:
 * WhatsApp + Instagram stories → wa.me
 * LinkedIn / Facebook / Google Business → verified website URL
 */
export function ctaForPlatform(
  platform: Platform,
  profile: BusinessProfile,
): string {
  const phoneDigits = profile.phone.replace(/\D/g, "");
  const wa = isolateUrl(`https://wa.me/${phoneDigits}`);
  const site = profile.websiteUrl
    ? isolateUrl(profile.websiteUrl)
    : isolatePhone(profile.phone);

  switch (platform) {
    case "whatsapp":
    case "instagram":
      return `${profile.standardCta} ${wa}`.trim();
    case "linkedin":
    case "facebook":
    case "google_business":
      return `${profile.standardCta} ${site}`.trim();
    default:
      return `${profile.standardCta} ${isolatePhone(profile.phone)}`.trim();
  }
}
