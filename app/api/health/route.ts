import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/env";
import { getAuthMode } from "@/lib/auth/config";

/**
 * Lightweight healthcheck — confirms required keys exist without exposing secrets.
 */
export async function GET() {
  const env = validateEnv();

  return NextResponse.json({
    ok: true,
    app: "one-loop-social",
    phase: 0,
    authMode: getAuthMode(),
    typescript: true,
    tailwind: true,
    tailwindRtl: true,
    brandTokens: {
      primary: "#0077F6",
      vivid: "#0284FE",
      deep: "#005AC2",
      light: "#4DACFF",
      soft: "#BAE6FD",
      slate: "#F8FAFC",
    },
    routes: {
      mobile: "/m",
      desktop: "/d",
      api: "/api/*",
    },
    env: {
      phase0Ready: env.phase0.ready,
      presentCount: env.present.length,
      missingCount: env.missing.length,
      present: env.present,
      missing: env.missing,
      groups: env.groups,
    },
  });
}
