/**
 * Auth / OAuth origin helpers — resilient across localhost:3000 vs :3001.
 */

export function getConfiguredAppUrl(): string | undefined {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.APP_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  return undefined;
}

/** Prefer browser origin when available so OAuth survives port drift. */
export function getRuntimeAppOrigin(request?: Request | { url: string }): string {
  if (typeof window !== "undefined") return window.location.origin;
  return resolveAppOrigin(request);
}

/** Server-side: prefer request origin, then env, then localhost:3000. */
export function resolveAppOrigin(request?: Request | { url: string }): string {
  if (request?.url) {
    try {
      return new URL(request.url).origin;
    } catch {
      /* fall through */
    }
  }
  return getConfiguredAppUrl() ?? "http://localhost:3000";
}

/** Client-side: always follow the live host/port. */
export function getClientOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return getConfiguredAppUrl() ?? "http://localhost:3000";
}

export function buildAppUrl(
  path: string,
  request?: Request | { url: string },
): string {
  const origin =
    typeof window !== "undefined"
      ? getClientOrigin()
      : resolveAppOrigin(request);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export {
  getAuthMode,
  isClerkConfigured,
} from "@/lib/auth/config";
