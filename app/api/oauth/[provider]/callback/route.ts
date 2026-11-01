import { NextResponse } from "next/server";
import { resolveAppOrigin } from "@/lib/auth";

/**
 * OAuth callback stub for Meta, LinkedIn, X, TikTok, YouTube, Google.
 * Redirects always use the live request origin (or NEXTAUTH_URL /
 * NEXT_PUBLIC_APP_URL) so localhost:3000 vs :3001 stays consistent.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const origin = resolveAppOrigin(request);

  if (error) {
    return NextResponse.redirect(
      new URL(`/d/settings?oauth=error&provider=${provider}`, origin),
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "missing_code", provider, origin },
      { status: 400 },
    );
  }

  // TODO: exchange code for tokens; encrypt; persist tokenRef
  return NextResponse.redirect(
    new URL(`/d/settings?oauth=connected&provider=${provider}`, origin),
  );
}
