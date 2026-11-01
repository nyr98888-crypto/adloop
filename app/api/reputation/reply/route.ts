import { NextResponse } from "next/server";
import { generateReviewReply } from "@/lib/ai/review-reply";
import { demoProfile, demoReviews } from "@/lib/demo/store";
import type { Locale, ReviewReplyPreset } from "@/lib/domain/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    reviewId: string;
    preset: ReviewReplyPreset;
    locale?: Locale;
  };

  const review = demoReviews.find((r) => r.id === body.reviewId);
  if (!review) {
    return NextResponse.json({ error: "review_not_found" }, { status: 404 });
  }

  const draft = generateReviewReply(
    demoProfile,
    review,
    body.preset,
    body.locale ?? "he",
  );

  return NextResponse.json({ draft });
}
