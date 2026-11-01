import type { NetworkEngagement, Platform } from "@/lib/domain/types";

const VIDEO = new Set<Platform>(["tiktok", "youtube", "instagram"]);

/** Deterministic placeholder stats so every enabled network has a live row. */
export function demoMetricsForPlatform(platform: Platform): NetworkEngagement {
  const seed = platform.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const likes = 12 + (seed % 90);
  const comments = 2 + (seed % 18);
  const shares = 1 + (seed % 24);
  const isVideo = VIDEO.has(platform);

  return {
    platform,
    likes,
    comments,
    shares,
    contentKind: isVideo ? "video" : "feed",
    videoPlays: isVideo ? 800 + seed * 17 : undefined,
    watchTimeSec: isVideo ? 4000 + seed * 40 : undefined,
    videoShares: isVideo ? 10 + (seed % 40) : undefined,
    whatsappLinkClicks: platform === "whatsapp" ? 40 + (seed % 50) : undefined,
    reviewsCount:
      platform === "google_business" || platform === "easy"
        ? 3 + (seed % 12)
        : undefined,
  };
}
