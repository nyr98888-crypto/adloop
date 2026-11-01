import { NextResponse } from "next/server";
import { isAppLocale } from "@/lib/i18n/config";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: string };
  if (!body.locale || !isAppLocale(body.locale)) {
    return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
  }
  const res = NextResponse.json({ locale: body.locale });
  res.cookies.set("locale", body.locale, { path: "/" });
  return res;
}
