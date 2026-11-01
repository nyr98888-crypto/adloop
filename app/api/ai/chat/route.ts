import { NextResponse } from "next/server";
import {
  buildAgentSystemPrompt,
  socialWorkerTools,
} from "@/lib/agent/social-worker";
import {
  demoAccounts,
  demoGaps,
  demoProfile,
  demoPulse,
  demoReviews,
} from "@/lib/demo/store";
import type { Locale } from "@/lib/domain/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    locale?: Locale;
  };
  const locale = body.locale ?? "he";
  const message = body.message?.trim() ?? "";

  const system = buildAgentSystemPrompt(locale);
  const gaps = socialWorkerTools.getCalendarGaps(demoGaps);
  const digest = socialWorkerTools.getReputationDigest(demoReviews);
  const pulse = socialWorkerTools.getEngagementSnapshot(demoPulse);

  let draft = null;
  if (message) {
    draft = socialWorkerTools.draftPostVariants({
      profile: demoProfile,
      accounts: demoAccounts,
      locale,
      userInput: { promptText: message },
    });
  }

  const reply =
    locale === "he"
      ? `קיבלתי את הבקשה לפוסט. יש ${gaps.length} חלונות פנויים ביומן ודירוג ממוצע ${digest.average}. טיוטת הפוסט מוכנה לבדיקה (ללא המצאות).`
      : `Got your Post request. ${gaps.length} open diary slots; avg rating ${digest.average}. Grounded Post draft ready for review.`;

  return NextResponse.json({
    system,
    reply,
    draft,
    gaps,
    digest,
    pulse,
  });
}
