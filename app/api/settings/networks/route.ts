import { NextResponse } from "next/server";
import {
  demoAccounts,
  setAccountEnabled,
  setAccountMode,
} from "@/lib/demo/store";
import type { ConnectionMode } from "@/lib/domain/types";

export async function GET() {
  return NextResponse.json({ accounts: demoAccounts });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    platform: string;
    enabled?: boolean;
    mode?: ConnectionMode;
  };

  if (typeof body.enabled === "boolean") {
    setAccountEnabled(body.platform, body.enabled);
  }
  if (body.mode) {
    setAccountMode(body.platform, body.mode);
  }

  return NextResponse.json({ accounts: demoAccounts });
}
