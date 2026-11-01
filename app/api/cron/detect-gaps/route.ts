import { NextResponse } from "next/server";
import { detectDiaryGapsWorkflow } from "@/workflows/detect-diary-gaps";
import { demoGaps } from "@/lib/demo/store";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = detectDiaryGapsWorkflow({
    gaps: demoGaps,
    tier: "growth",
    locale: "he",
  });

  return NextResponse.json(result);
}
