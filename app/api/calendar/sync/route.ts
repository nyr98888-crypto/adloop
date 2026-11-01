import { NextResponse } from "next/server";
import { syncCalendarWorkflow } from "@/workflows/sync-calendar";
import { demoGaps, DEMO_BUSINESS_ID } from "@/lib/demo/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    googleAccountRef?: string;
    appleIcsUrl?: string;
  };

  const result = await syncCalendarWorkflow({
    businessId: DEMO_BUSINESS_ID,
    googleAccountRef: body.googleAccountRef,
    appleIcsUrl: body.appleIcsUrl,
  });

  // Merge demo gaps when live sync returns empty (local demo)
  const gaps = result.gaps.length ? result.gaps : demoGaps;

  return NextResponse.json({
    events: result.events,
    gaps,
  });
}

export async function GET() {
  return NextResponse.json({ gaps: demoGaps });
}
