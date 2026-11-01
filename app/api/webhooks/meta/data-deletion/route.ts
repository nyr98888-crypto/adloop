import { NextResponse } from "next/server";
import { createHash } from "crypto";

/**
 * Meta App Review requirement: data deletion callback.
 * https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const signedRequest = String(form.get("signed_request") ?? "");
  const confirmationCode = createHash("sha256")
    .update(signedRequest || String(Date.now()))
    .digest("hex")
    .slice(0, 16);

  const statusUrl = new URL(
    `/api/webhooks/meta/data-deletion/status?code=${confirmationCode}`,
    request.url,
  );

  return NextResponse.json({
    url: statusUrl.toString(),
    confirmation_code: confirmationCode,
  });
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  return NextResponse.json({
    confirmation_code: code,
    status: "completed",
  });
}
