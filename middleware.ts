import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isAppLocale } from "@/lib/i18n/config";

const MOBILE_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Locale cookie bootstrap
  const localeCookie = request.cookies.get("locale")?.value;
  if (!localeCookie || !isAppLocale(localeCookie)) {
    const accept = request.headers.get("accept-language") ?? "";
    const locale = accept.toLowerCase().startsWith("en") ? "en" : defaultLocale;
    response.cookies.set("locale", locale, { path: "/" });
  }

  // Viewport shell preference
  const shellCookie = request.cookies.get("shell")?.value;
  const ua = request.headers.get("user-agent") ?? "";
  const isMobile = MOBILE_RE.test(ua);

  if (pathname === "/") {
    const shell =
      shellCookie === "mobile" || shellCookie === "desktop"
        ? shellCookie
        : isMobile
          ? "mobile"
          : "desktop";
    const url = request.nextUrl.clone();
    url.pathname = shell === "mobile" ? "/m" : "/d";
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set("shell", shell, { path: "/" });
    if (!localeCookie || !isAppLocale(localeCookie)) {
      const accept = request.headers.get("accept-language") ?? "";
      const locale = accept.toLowerCase().startsWith("en")
        ? "en"
        : defaultLocale;
      redirect.cookies.set("locale", locale, { path: "/" });
    }
    return redirect;
  }

  // Phone UA on desktop routes → prefer dedicated mobile shell
  if (isMobile && pathname.startsWith("/d") && shellCookie !== "desktop") {
    const url = request.nextUrl.clone();
    url.pathname = "/m";
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set("shell", "mobile", { path: "/" });
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
