import type { BusinessProfile, Locale } from "@/lib/domain/types";
import type { AgentMode } from "@/lib/ai/agent/schemas";
import { isolatePhone, isolateUrl } from "@/lib/i18n/bidi";

export type PromptBusiness = Pick<
  BusinessProfile,
  "name" | "trade" | "phone" | "websiteUrl" | "workingHours" | "location" | "immutableFacts" | "toneOfVoice" | "standardCta"
> & {
  hours?: string;
  serviceArea?: string;
  whatsappUrl?: string;
};

function resolveWhatsAppUrl(business: PromptBusiness): string {
  if (business.whatsappUrl) return isolateUrl(business.whatsappUrl);
  const digits = business.phone.replace(/\D/g, "");
  return isolateUrl(`https://wa.me/${digits}`);
}

function serviceAreaOf(business: PromptBusiness): string {
  if (business.serviceArea) return business.serviceArea;
  return [business.location?.city, business.location?.region]
    .filter(Boolean)
    .join(" · ");
}

const MODE_APPENDIX: Record<AgentMode, string> = {
  proactive_nudge: `
MODE: Pipeline A — Nudge Engine (dead-zone alert).
Return JSON: { "headline", "cta", "seedPrompt", "urgency" }.
One-line Social Worker headline. Mention the calendar gap only if provided.
`.trim(),
  studio_generate: `
MODE: Pipeline B — Studio Post Generation.
Return JSON with: whatsapp, facebook, instagram, tiktok_reels_hook, youtube,
linkedin, x, threads, reddit, google_business, easy, extracted_facts[].
WhatsApp must include bullets, emojis, and the WhatsApp direct CTA link.
X must be ≤ 280 characters. tiktok_reels_hook = first 3 spoken seconds only.
`.trim(),
  review_reply: `
MODE: Pipeline C — Review Replies.
Return JSON: { "warm_grateful", "professional_concise", "deescalating_compromise", "grounding_notes": [] }.
De-escalating never admits legal fault; invite private phone contact only.
`.trim(),
};

/**
 * Canonical Social Worker system prompt.
 * Business constants are immutable for the model — users edit them in Settings.
 */
export function buildSystemPrompt(
  business: PromptBusiness | BusinessProfile,
  mode: AgentMode | string,
  locale: Locale = "he",
): string {
  const hours =
    ("hours" in business && business.hours) ||
    business.workingHours ||
    "—";
  const serviceArea = serviceAreaOf(business as PromptBusiness);
  const whatsappUrl = resolveWhatsAppUrl(business as PromptBusiness);
  const website = business.websiteUrl
    ? isolateUrl(business.websiteUrl)
    : "None";
  const phone = isolatePhone(business.phone);
  const lang = locale === "en" ? "English" : "native Hebrew";
  const modeKey = (
    mode === "proactive_nudge" ||
    mode === "studio_generate" ||
    mode === "review_reply"
      ? mode
      : "studio_generate"
  ) as AgentMode;

  return `
You are the dedicated Social Worker AI marketing director for the business: "${business.name}".
Your language is fluent, ${lang} depending on request.

IMMUTABLE VERIFIED BUSINESS FACTS:
- Business Name: ${business.name}
- Profession / Trade: ${business.trade}
- Verified Contact Phone: ${phone}
- Operating Hours: ${hours}
- Primary Service Area: ${serviceArea}
- WhatsApp Direct Link: ${whatsappUrl}
- Website URL: ${website}
${
  business.immutableFacts?.length
    ? `- Extra verified facts: ${business.immutableFacts.join("; ")}`
    : ""
}

STRICT GROUNDING & ANTI-HALLUCINATION RULES:
1. NEVER invent discounts, percentage sales, warranties, or free inspections unless explicitly stated in the User Input.
2. NEVER mention fake certifications, fictitious team members, or awards.
3. Every claim about the work done must originate directly from the User Input.
4. Always wrap URLs and phone numbers in Unicode Directional marks (\\u2066 and \\u2069) to preserve bi-directional Hebrew RTL alignment.
5. In WhatsApp posts, always append the direct CTA link: ${whatsappUrl}.
6. Output MUST be valid JSON adhering strictly to the requested schema.
7. If a detail is missing, omit it — do not guess.

${MODE_APPENDIX[modeKey]}
`.trim();
}
