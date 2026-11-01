export type SocialPlatformId =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "x"
  | "threads"
  | "reddit"
  | "google_business"
  | "easy";

export type ConnectionMode = "official_api" | "manual_deeplink";

export interface SocialNetworkDefinition {
  id: SocialPlatformId;
  nameEn: string;
  nameHe: string;
  subtitleEn: string;
  subtitleHe: string;
  brandColor: string;
  defaultMode: ConnectionMode;
  supportsOfficialApi: boolean;
}

/** Complete promotional platform catalog */
export const SOCIAL_NETWORKS: SocialNetworkDefinition[] = [
  {
    id: "whatsapp",
    nameEn: "WhatsApp",
    nameHe: "וואטסאפ",
    subtitleEn: "Business / Groups / Status",
    subtitleHe: "עסקי / קבוצות / סטטוס",
    brandColor: "#25D366",
    defaultMode: "manual_deeplink",
    supportsOfficialApi: true,
  },
  {
    id: "instagram",
    nameEn: "Instagram",
    nameHe: "אינסטגרם",
    subtitleEn: "Feed, Reels, Stories",
    subtitleHe: "פיד, רילס, סטוריז",
    brandColor: "#E1306C",
    defaultMode: "manual_deeplink",
    supportsOfficialApi: true,
  },
  {
    id: "facebook",
    nameEn: "Facebook",
    nameHe: "פייסבוק",
    subtitleEn: "Business Page / Personal Profile",
    subtitleHe: "עמוד עסקי / פרופיל אישי",
    brandColor: "#1877F2",
    defaultMode: "official_api",
    supportsOfficialApi: true,
  },
  {
    id: "tiktok",
    nameEn: "TikTok",
    nameHe: "טיקטוק",
    subtitleEn: "Short-form video",
    subtitleHe: "סרטונים קצרים",
    brandColor: "#010101",
    defaultMode: "manual_deeplink",
    supportsOfficialApi: true,
  },
  {
    id: "youtube",
    nameEn: "YouTube",
    nameHe: "יוטיוב",
    subtitleEn: "Shorts & Videos",
    subtitleHe: "שורטס וסרטונים",
    brandColor: "#FF0000",
    defaultMode: "official_api",
    supportsOfficialApi: true,
  },
  {
    id: "linkedin",
    nameEn: "LinkedIn",
    nameHe: "לינקדאין",
    subtitleEn: "Company Page & Personal",
    subtitleHe: "עמוד חברה ואישי",
    brandColor: "#0A66C2",
    defaultMode: "official_api",
    supportsOfficialApi: true,
  },
  {
    id: "x",
    nameEn: "X (Twitter)",
    nameHe: "X (טוויטר)",
    subtitleEn: "Posts & threads",
    subtitleHe: "פוסטים ושרשורים",
    brandColor: "#000000",
    defaultMode: "official_api",
    supportsOfficialApi: true,
  },
  {
    id: "threads",
    nameEn: "Threads",
    nameHe: "Threads",
    subtitleEn: "Text-first feed",
    subtitleHe: "פיד טקסטואלי",
    brandColor: "#000000",
    defaultMode: "manual_deeplink",
    supportsOfficialApi: true,
  },
  {
    id: "reddit",
    nameEn: "Reddit",
    nameHe: "רדיט",
    subtitleEn: "Communities & posts",
    subtitleHe: "קהילות ופוסטים",
    brandColor: "#FF4500",
    defaultMode: "manual_deeplink",
    supportsOfficialApi: false,
  },
  {
    id: "google_business",
    nameEn: "Google Business Profile",
    nameHe: "גוגל לעסק",
    subtitleEn: "Local posts & updates",
    subtitleHe: "פוסטים ועדכונים מקומיים",
    brandColor: "#4285F4",
    defaultMode: "official_api",
    supportsOfficialApi: true,
  },
  {
    id: "easy",
    nameEn: "Easy.co.il",
    nameHe: "איזי",
    subtitleEn: "Israeli local directory",
    subtitleHe: "מדריך עסקים מקומי",
    brandColor: "#00A3E0",
    defaultMode: "manual_deeplink",
    supportsOfficialApi: false,
  },
];

export function getSocialNetwork(id: SocialPlatformId) {
  return SOCIAL_NETWORKS.find((n) => n.id === id);
}
