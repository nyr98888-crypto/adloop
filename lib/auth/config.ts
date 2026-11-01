/**
 * Clerk auth — keys from `.env.local`:
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
 *
 * Redirect / app origin: prefer live request `window.location.origin` or
 * `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` (see `lib/auth.ts`) so OAuth survives
 * localhost port changes (3000 ↔ 3001).
 */
export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

export function getAuthMode(): "clerk" | "demo" {
  return isClerkConfigured() ? "clerk" : "demo";
}

export function getAuthRedirectBase(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
