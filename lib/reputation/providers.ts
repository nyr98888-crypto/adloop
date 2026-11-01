import type { ReviewFeedItem } from "@/lib/domain/types";

export interface ReputationProvider {
  id: "google" | "easy";
  fetchReviews(businessRef: string): Promise<ReviewFeedItem[]>;
}

/** Google Business Profile API */
export class GoogleReputationProvider implements ReputationProvider {
  id = "google" as const;
  async fetchReviews(locationId: string): Promise<ReviewFeedItem[]> {
    void locationId;
    // Production: GBP API
    return [];
  }
}

/**
 * Easy.co.il adapter — v1 manual import / user-initiated refresh only.
 * Automated public-page fetch requires legal review (v2).
 */
export class EasyReputationProvider implements ReputationProvider {
  id = "easy" as const;
  async fetchReviews(url: string): Promise<ReviewFeedItem[]> {
    void url;
    return [];
  }

  importManual(
    orgId: string,
    businessId: string,
    rows: Array<{
      externalId: string;
      rating: number;
      text: string;
      authorName?: string;
      createdAt?: string;
    }>,
  ): ReviewFeedItem[] {
    const now = new Date().toISOString();
    return rows.map((r) => ({
      id: `easy_${r.externalId}`,
      orgId,
      businessId,
      source: "easy" as const,
      externalId: r.externalId,
      rating: r.rating,
      text: r.text,
      authorName: r.authorName,
      createdAt: r.createdAt ?? now,
      provenance: { method: "manual_import" as const, fetchedAt: now },
    }));
  }
}

export function unifiedRating(
  googleAvg: number | null,
  easyAvg: number | null,
): number | null {
  const vals = [googleAvg, easyAvg].filter(
    (v): v is number => typeof v === "number",
  );
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}
