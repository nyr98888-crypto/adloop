import { neon } from "@neondatabase/serverless";

/**
 * Neon Postgres client — activates when DATABASE_URL is set in `.env.local`.
 * Until then, app pages use `lib/demo/store.ts`.
 */
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
