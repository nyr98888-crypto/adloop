/**
 * 15s client-side timeout for AI routes.
 * On timeout/failure, callers should fall back to raw text + unedited media.
 */
export async function fetchAiWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  ms = 15_000,
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; fallback: true; reason: "timeout" | "error" | "http" }
> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, fallback: true, reason: "http" };
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    clearTimeout(timer);
    const reason =
      err instanceof DOMException && err.name === "AbortError"
        ? "timeout"
        : "error";
    return { ok: false, fallback: true, reason };
  }
}

export function buildRawFallbackPost(input: {
  promptText: string;
  locale: "he" | "en";
}) {
  return {
    fallback: true as const,
    caption: input.promptText,
    message:
      input.locale === "he"
        ? "ה־AI לא הגיב בזמן — אפשר לפרסם את הטקסט והתמונה כפי שהם."
        : "AI timed out — you can publish the raw text and photo as-is.",
  };
}
