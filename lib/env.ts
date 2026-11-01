import { z } from "zod";

/**
 * Environment validation — reports presence only, never returns secret values.
 * Keys live in `.env.local` (gitignored).
 */

const optionalSecret = z.string().min(1).optional();

/** Schema used only to check shape / presence — parsed values are discarded. */
const EnvPresenceSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optionalSecret,
  CLERK_SECRET_KEY: optionalSecret,
  DATABASE_URL: optionalSecret,
  BLOB_READ_WRITE_TOKEN: optionalSecret,
  OPENROUTER_API_KEY: optionalSecret,
  AI_GATEWAY_API_KEY: optionalSecret,
  FAL_KEY: optionalSecret,
  TOGETHER_API_KEY: optionalSecret,
  STRIPE_SECRET_KEY: optionalSecret,
  STRIPE_WEBHOOK_SECRET: optionalSecret,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalSecret,
  META_APP_ID: optionalSecret,
  META_APP_SECRET: optionalSecret,
  META_ACCESS_TOKEN: optionalSecret,
  GOOGLE_CLIENT_ID: optionalSecret,
  GOOGLE_CLIENT_SECRET: optionalSecret,
  CRON_SECRET: optionalSecret,
  TOKEN_ENCRYPTION_KEY: optionalSecret,
});

export type EnvKey = keyof z.infer<typeof EnvPresenceSchema>;

export const ENV_KEYS = Object.keys(
  EnvPresenceSchema.shape,
) as EnvKey[];

/** Phase 0 core keys recommended before leaving demo mode */
export const PHASE0_REQUIRED_KEYS: EnvKey[] = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "BLOB_READ_WRITE_TOKEN",
];

function isPresent(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function hasEnv(key: EnvKey): boolean {
  return isPresent(process.env[key]);
}

/**
 * Returns which keys are set vs missing. Never includes secret values.
 */
export function validateEnv(): {
  ok: boolean;
  present: EnvKey[];
  missing: EnvKey[];
  phase0: {
    ready: boolean;
    present: EnvKey[];
    missing: EnvKey[];
  };
  groups: Record<string, boolean>;
} {
  const present: EnvKey[] = [];
  const missing: EnvKey[] = [];

  for (const key of ENV_KEYS) {
    if (hasEnv(key)) present.push(key);
    else missing.push(key);
  }

  // Soft-parse to ensure no unexpected crashes; ignore values
  EnvPresenceSchema.safeParse(
    Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k] || undefined])),
  );

  const phase0Present = PHASE0_REQUIRED_KEYS.filter((k) => hasEnv(k));
  const phase0Missing = PHASE0_REQUIRED_KEYS.filter((k) => !hasEnv(k));

  return {
    ok: phase0Missing.length === 0,
    present,
    missing,
    phase0: {
      ready: phase0Missing.length === 0,
      present: phase0Present,
      missing: phase0Missing,
    },
    groups: {
      clerk: hasEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") && hasEnv("CLERK_SECRET_KEY"),
      neon: hasEnv("DATABASE_URL"),
      blob: hasEnv("BLOB_READ_WRITE_TOKEN"),
      stripe: hasEnv("STRIPE_SECRET_KEY"),
      openrouter: hasEnv("OPENROUTER_API_KEY"),
      meta: hasEnv("META_APP_ID") && hasEnv("META_APP_SECRET"),
      google: hasEnv("GOOGLE_CLIENT_ID") && hasEnv("GOOGLE_CLIENT_SECRET"),
    },
  };
}

/** @deprecated use validateEnv().groups */
export function phase0Status() {
  return validateEnv().groups;
}

/** Never use in client bundles for secret keys */
export function readEnv(key: EnvKey): string | undefined {
  const value = process.env[key];
  return isPresent(value) ? value : undefined;
}
