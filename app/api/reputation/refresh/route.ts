import { NextResponse } from "next/server";
import { refreshReputationWorkflow } from "@/workflows/refresh-reputation";
import {
  DEMO_BUSINESS_ID,
  DEMO_ORG_ID,
  demoReviews,
} from "@/lib/demo/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    googleLocationId?: string;
    easyUrl?: string;
    easyManualRows?: Array<{
      externalId: string;
      rating: number;
      text: string;
      authorName?: string;
    }>;
  };

  const fetched = await refreshReputationWorkflow({
    orgId: DEMO_ORG_ID,
    businessId: DEMO_BUSINESS_ID,
    ...body,
  });

  return NextResponse.json({
    reviews: fetched.length ? fetched : demoReviews,
  });
}

export async function GET() {
  return NextResponse.json({ reviews: demoReviews });
}
