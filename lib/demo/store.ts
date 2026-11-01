import type {
  BusinessProfile,
  ConnectedAccount,
  DiaryGap,
  EngagementPulse,
  Platform,
  PostPayload,
  ReviewFeedItem,
} from "@/lib/domain/types";
import { SOCIAL_NETWORKS } from "@/types/social";

export const DEMO_ORG_ID = "org_demo";
export const DEMO_BUSINESS_ID = "biz_demo";

export const demoProfile: BusinessProfile = {
  id: DEMO_BUSINESS_ID,
  orgId: DEMO_ORG_ID,
  name: "ניר אינסטלציה",
  trade: "אינסטלציה",
  location: { city: "רעננה", address: "הרצל 12", region: "השרון" },
  phone: "050-1234567",
  websiteUrl: "https://nir-plumbing.example.co.il",
  workingHours: "א׳–ה׳ 08:00–18:00",
  localeDefault: "he",
  toneOfVoice: "ידידותי, ישיר, מקצועי",
  standardCta: "להזמנה חייגו",
  immutableFacts: [
    "רישיון אינסטלטור מוסמך",
    "שירות באזור השרון",
  ],
  timezone: "Asia/Jerusalem",
};

const defaultEnabled = new Set([
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
]);

/** Mutable in-memory settings for demo toggles */
export const demoAccounts: ConnectedAccount[] = SOCIAL_NETWORKS.map((net) => ({
  id: `acc_${net.id}`,
  orgId: DEMO_ORG_ID,
  businessId: DEMO_BUSINESS_ID,
  platform: net.id,
  mode: net.defaultMode,
  status: defaultEnabled.has(net.id) ? "active" : "disconnected",
  enabled: defaultEnabled.has(net.id),
  displayName: net.nameEn,
  scopes: net.supportsOfficialApi && net.defaultMode === "official_api"
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

function thursdayAfternoonGap(): DiaryGap {
  const now = new Date();
  const day = now.getDay();
  const daysUntilThu = (4 - day + 7) % 7 || 7;
  const start = new Date(now);
  start.setDate(now.getDate() + daysUntilThu);
  start.setHours(14, 0, 0, 0);
  const end = new Date(start);
  end.setHours(17, 0, 0, 0);
  return {
    id: "gap_thu_pm",
    businessId: DEMO_BUSINESS_ID,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    reason: "empty_afternoon",
    status: "open",
  };
}

export const demoGaps: DiaryGap[] = [thursdayAfternoonGap()];

export const demoReviews: ReviewFeedItem[] = [
  {
    id: "rev_g1",
    orgId: DEMO_ORG_ID,
    businessId: DEMO_BUSINESS_ID,
    source: "google",
    externalId: "g1",
    rating: 5,
    text: "הגיע מהר ותיקן את הנזילה במקצועיות.",
    authorName: "דנה כ.",
    createdAt: new Date().toISOString(),
    provenance: { method: "api", fetchedAt: new Date().toISOString() },
  },
  {
    id: "rev_e1",
    orgId: DEMO_ORG_ID,
    businessId: DEMO_BUSINESS_ID,
    source: "easy",
    externalId: "e1",
    rating: 2,
    text: "המתנה ארוכה מהצפוי.",
    authorName: "יוסי",
    createdAt: new Date().toISOString(),
    provenance: {
      method: "manual_import",
      fetchedAt: new Date().toISOString(),
    },
  },
];

export const demoPulse: EngagementPulse = {
  topPostOfWeek: {
    postId: "post_demo_1",
    platform: "instagram",
    captionSnippet: "תיקון דוד שמש ברעננה — לפני ואחרי",
    imageUrl: undefined,
    score: 128,
    reach: 1840,
  },
  perNetworkReactions: [
    {
      platform: "facebook",
      likes: 42,
      comments: 7,
      shares: 5,
      contentKind: "feed",
    },
    {
      platform: "instagram",
      likes: 96,
      comments: 12,
      shares: 18,
      videoPlays: 4200,
      watchTimeSec: 18600,
      videoShares: 64,
      contentKind: "mixed",
    },
    {
      platform: "whatsapp",
      likes: 0,
      comments: 18,
      shares: 0,
      whatsappLinkClicks: 64,
      contentKind: "feed",
    },
    {
      platform: "tiktok",
      likes: 210,
      comments: 9,
      shares: 41,
      videoPlays: 12800,
      watchTimeSec: 54000,
      videoShares: 210,
      contentKind: "video",
    },
    {
      platform: "youtube",
      likes: 55,
      comments: 4,
      shares: 3,
      videoPlays: 3100,
      watchTimeSec: 22000,
      videoShares: 28,
      contentKind: "video",
    },
    {
      platform: "google_business",
      likes: 12,
      comments: 3,
      shares: 0,
      reviewsCount: 8,
      contentKind: "feed",
    },
    {
      platform: "easy",
      likes: 0,
      comments: 2,
      shares: 0,
      reviewsCount: 5,
      contentKind: "feed",
    },
    {
      platform: "linkedin",
      likes: 18,
      comments: 4,
      shares: 2,
      contentKind: "feed",
    },
    {
      platform: "x",
      likes: 33,
      comments: 5,
      shares: 9,
      contentKind: "feed",
    },
    {
      platform: "threads",
      likes: 27,
      comments: 6,
      shares: 3,
      contentKind: "feed",
    },
    {
      platform: "reddit",
      likes: 61,
      comments: 14,
      shares: 7,
      contentKind: "feed",
    },
  ],
  whatsappDirectLinkClicks: 64,
  unifiedRatingIndex: {
    googleAvg: 4.8,
    easyAvg: 4.2,
    combined: 4.5,
    googleCount: 28,
    easyCount: 14,
  },
};

export type RecentPublication = {
  id: string;
  platform: Platform;
  title: string;
  status: "published" | "scheduled";
  reactions: number;
  publishedAt: string;
};

export const demoRecentPublications: RecentPublication[] = [
  {
    id: "pub_1",
    platform: "instagram",
    title: "תיקון דוד שמש — לפני ואחרי",
    status: "published",
    reactions: 128,
    publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "pub_2",
    platform: "tiktok",
    title: "איך מאתרים נזילה בקיר ב־30 שניות",
    status: "published",
    reactions: 210,
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "pub_3",
    platform: "facebook",
    title: "חלון פנוי ביום חמישי אחה״צ",
    status: "scheduled",
    reactions: 0,
    publishedAt: new Date(Date.now() + 2 * 86400000).toISOString(),
  },
  {
    id: "pub_4",
    platform: "whatsapp",
    title: "עדכון שירות באזור השרון",
    status: "published",
    reactions: 64,
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const postStore = new Map<string, PostPayload>();

export function savePost(post: PostPayload) {
  postStore.set(post.id, post);
  return post;
}

export function getPost(id: string) {
  return postStore.get(id);
}

export function updatePostVariant(
  postId: string,
  connectedAccountId: string,
  patch: Partial<PostPayload["variants"][number]>,
) {
  const post = postStore.get(postId);
  if (!post) return null;
  post.variants = post.variants.map((v) =>
    v.connectedAccountId === connectedAccountId
      ? { ...v, ...patch, dirty: true }
      : v,
  );
  postStore.set(postId, post);
  return post;
}

export function enabledAccounts() {
  return demoAccounts.filter((a) => a.enabled && a.status !== "disconnected");
}

export function setAccountEnabled(platform: string, enabled: boolean) {
  const acc = demoAccounts.find((a) => a.platform === platform);
  if (!acc) return null;
  acc.enabled = enabled;
  acc.status = enabled ? "active" : "disconnected";
  return acc;
}

export function setAccountMode(
  platform: string,
  mode: ConnectedAccount["mode"],
) {
  const acc = demoAccounts.find((a) => a.platform === platform);
  if (!acc) return null;
  acc.mode = mode;
  return acc;
}
