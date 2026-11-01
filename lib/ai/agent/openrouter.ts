import { resolveAppOrigin } from "@/lib/auth";
import type { z } from "zod";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function hasOpenRouterKey(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

/**
 * Structured JSON completion via OpenRouter (GPT-4o).
 * Low temperature for anti-hallucination. Validates with Zod.
 */
export async function openRouterStructured<T>(opts: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  request?: Request;
  model?: string;
  temperature?: number;
}): Promise<{ ok: true; data: T; source: "openrouter" } | { ok: false; error: string }> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "missing_openrouter_key" };
  }

  const referer = resolveAppOrigin(opts.request);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14_000);

  try {
    // Key stays server-only — never returned to the client
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "One Loop Social",
      },
      body: JSON.stringify({
        model: opts.model ?? "openai/gpt-4o",
        temperature: opts.temperature ?? 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });
    clearTimeout(timer);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        error: `openrouter_http_${response.status}:${body.slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return { ok: false, error: "empty_completion" };

    const parsedJson = JSON.parse(raw) as unknown;
    const validated = opts.schema.safeParse(parsedJson);
    if (!validated.success) {
      return {
        ok: false,
        error: `schema_mismatch:${validated.error.message}`,
      };
    }

    return { ok: true, data: validated.data, source: "openrouter" };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: "openrouter_timeout" };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "openrouter_failed",
    };
  }
}
