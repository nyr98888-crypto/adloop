"use client";

import { useCallback, useState } from "react";
import { useBusiness } from "@/context/BusinessContext";
import type {
  DiaryGap,
  Locale,
  PostPayload,
  ReviewFeedItem,
  ReviewReplyPreset,
} from "@/lib/domain/types";
import type {
  NudgeResult,
  PostGeneration,
  ReviewPresets,
} from "@/lib/ai/agent/schemas";

/** 15s client timeout for Social Worker agent calls */
export const AGENT_TIMEOUT_MS = 15_000;

type StudioAgentResult = {
  generation: PostGeneration;
  post: PostPayload;
  mode: "auto" | "coached";
  source: "openrouter" | "local";
  questions?: string[];
};

type NudgeAgentResult = {
  success: boolean;
  data: NudgeResult;
  source: "openrouter" | "local";
};

type ReviewAgentResult = {
  success: boolean;
  data: ReviewPresets;
  draft: {
    preset: ReviewReplyPreset;
    text: string;
    groundingRefs: string[];
  };
  source: "openrouter" | "local";
};

async function agentFetch(
  body: Record<string, unknown>,
  ms = AGENT_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("timeout");
    }
    throw err;
  }
}

/**
 * Frontend bridge to POST /api/agent
 * Pipelines: studio_generate · proactive_nudge · review_reply
 */
export function useSocialWorker(locale: Locale = "he") {
  const { activeBusiness, enabledAccounts } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Pipeline B — Studio post generation across platforms */
  const generateGroundedPost = useCallback(
    async (
      rawInput: string,
      slotContext?: string | DiaryGap | Record<string, unknown> | null,
    ): Promise<StudioAgentResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = (await agentFetch({
          mode: "studio_generate",
          locale,
          businessProfile: {
            ...activeBusiness,
            accounts: enabledAccounts,
          },
          userInput: rawInput,
          calendarGap: slotContext ?? undefined,
          enabledPlatforms: enabledAccounts.map((a) => a.platform),
        })) as {
          success?: boolean;
          error?: string;
          data?: PostGeneration;
          post?: PostPayload;
          mode?: "auto" | "coached";
          source?: "openrouter" | "local";
          questions?: string[];
        };

        if (!result.success || !result.post || !result.data) {
          throw new Error(result.error || "studio_generate_failed");
        }
        return {
          generation: result.data,
          post: result.post,
          mode: result.mode ?? "auto",
          source: result.source ?? "local",
          questions: result.questions,
        };
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message === "timeout"
            ? locale === "he"
              ? "ה־AI לא הגיב תוך 15 שניות"
              : "AI timed out after 15 seconds"
            : err instanceof Error
              ? err.message
              : "agent_error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [activeBusiness, enabledAccounts, locale],
  );

  /** Pipeline A — calendar gap + inactivity dead-zone nudge */
  const getProactiveNudge = useCallback(
    async (
      daysSinceLastPost: number,
      nextGap?: DiaryGap | null,
    ): Promise<NudgeAgentResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = (await agentFetch({
          mode: "proactive_nudge",
          locale,
          businessProfile: activeBusiness,
          userInput: { daysSinceLastPost },
          calendarGap: nextGap ?? null,
        })) as NudgeAgentResult & { error?: string };

        if (!result.success) {
          throw new Error(result.error || "nudge_failed");
        }
        return result;
      } catch (err: unknown) {
        setError(
          err instanceof Error && err.message === "timeout"
            ? "timeout"
            : err instanceof Error
              ? err.message
              : "agent_error",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [activeBusiness, locale],
  );

  /** Pipeline C — Warm / Brief / Compromise review replies */
  const generateReviewReplies = useCallback(
    async (
      review: Pick<
        ReviewFeedItem,
        | "id"
        | "source"
        | "rating"
        | "text"
        | "authorName"
        | "externalId"
        | "createdAt"
        | "provenance"
      >,
      preset?: ReviewReplyPreset,
    ): Promise<ReviewAgentResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = (await agentFetch({
          mode: "review_reply",
          locale,
          businessProfile: activeBusiness,
          reviewItem: review,
          preset,
        })) as ReviewAgentResult & { error?: string };

        if (!result.success) {
          throw new Error(result.error || "review_reply_failed");
        }
        return result;
      } catch (err: unknown) {
        setError(
          err instanceof Error && err.message === "timeout"
            ? "timeout"
            : err instanceof Error
              ? err.message
              : "agent_error",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [activeBusiness, locale],
  );

  return {
    generateGroundedPost,
    getProactiveNudge,
    generateReviewReplies,
    loading,
    error,
    activeBusiness,
  };
}
