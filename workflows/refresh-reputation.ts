import {
  EasyReputationProvider,
  GoogleReputationProvider,
} from "@/lib/reputation/providers";
import type { ReviewFeedItem } from "@/lib/domain/types";

export async function refreshReputationWorkflow(input: {
  orgId: string;
  businessId: string;
  googleLocationId?: string;
  easyUrl?: string;
  easyManualRows?: Array<{
    externalId: string;
    rating: number;
    text: string;
    authorName?: string;
  }>;
}): Promise<ReviewFeedItem[]> {
  const reviews: ReviewFeedItem[] = [];

  if (input.googleLocationId) {
    const google = new GoogleReputationProvider();
    reviews.push(...(await google.fetchReviews(input.googleLocationId)));
  }

  const easy = new EasyReputationProvider();
  if (input.easyManualRows?.length) {
    reviews.push(
      ...easy.importManual(
        input.orgId,
        input.businessId,
        input.easyManualRows,
      ),
    );
  } else if (input.easyUrl) {
    // v1: no automated scrape — returns empty until legal-reviewed v2
    reviews.push(...(await easy.fetchReviews(input.easyUrl)));
  }

  return reviews;
}
