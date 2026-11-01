import { NextResponse } from "next/server";
import { demoAccounts, demoProfile, savePost } from "@/lib/demo/store";
import type {
  DiaryGap,
  Locale,
  Platform,
  ReviewFeedItem,
  ReviewReplyPreset,
} from "@/lib/domain/types";
import { AgentRequestSchema } from "@/lib/ai/agent/schemas";
import {
  asProfile,
  runNudgePipeline,
  runReviewPipeline,
  runStudioPipeline,
} from "@/lib/ai/agent/pipelines";

/**
 * POST /api/agent
 *
 * Pipeline A — proactive_nudge  (Home dead-zone)
 * Pipeline B — studio_generate  (Post Studio)
 * Pipeline C — review_reply     (Reviews AI)
 *
 * Reads OPENROUTER_API_KEY only on the server. Uses GPT-4o JSON mode
 * (temperature 0.2). Falls back to grounded local pipeline if the key
 * is missing or the remote call fails/times out.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = AgentRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_request",
          details: parsed.error.flatten(),
          openrouterConfigured: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
        },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const locale: Locale = body.locale ?? "he";
    const profile = asProfile(body.businessProfile, demoProfile);

    if (body.mode === "proactive_nudge") {
      const input =
        body.userInput && typeof body.userInput === "object"
          ? (body.userInput as { daysSinceLastPost?: number })
          : {};
      const daysSinceLastPost = Number(input.daysSinceLastPost ?? 4);
      const calendarGap = (body.calendarGap as DiaryGap | null) ?? null;

      const result = await runNudgePipeline({
        profile,
        locale,
        calendarGap,
        daysSinceLastPost,
        request: req,
      });

      return NextResponse.json({
        success: true,
        mode: body.mode,
        source: result.source,
        data: result.data,
      });
    }

    if (body.mode === "studio_generate") {
      const userInput =
        typeof body.userInput === "string"
          ? body.userInput
          : body.userInput && typeof body.userInput === "object"
            ? String(
                (body.userInput as { promptText?: string; text?: string })
                  .promptText ??
                  (body.userInput as { text?: string }).text ??
                  "",
              )
            : "";

      if (!userInput.trim()) {
        return NextResponse.json(
          { success: false, error: "missing_user_input" },
          { status: 400 },
        );
      }

      const enabledPlatforms = (body.enabledPlatforms ?? []) as Platform[];
      const accounts =
        enabledPlatforms.length > 0
          ? demoAccounts
              .filter((a) => enabledPlatforms.includes(a.platform))
              .map((a) => ({
                ...a,
                enabled: true,
                status: "active" as const,
                businessId: profile.id,
                orgId: profile.orgId,
              }))
          : demoAccounts
              .filter((a) => a.enabled)
              .map((a) => ({
                ...a,
                businessId: profile.id,
                orgId: profile.orgId,
              }));

      // Prefer client-supplied account ids when mirrored in businessProfile payload
      const clientAccounts = (
        body.businessProfile as { accounts?: typeof demoAccounts } | undefined
      )?.accounts;

      const enabledAccounts =
        Array.isArray(clientAccounts) && clientAccounts.length
          ? clientAccounts.filter((a) => a.enabled)
          : accounts;

      const result = await runStudioPipeline({
        profile,
        locale,
        userInput,
        calendarGap: body.calendarGap,
        enabledAccounts,
        request: req,
      });

      savePost(result.data.post);

      return NextResponse.json({
        success: true,
        pipeline: body.mode,
        source: result.source,
        data: result.data.generation,
        post: result.data.post,
        /** Studio consumer expects mode auto|coached */
        mode: result.data.mode,
      });
    }

    if (body.mode === "review_reply") {
      const reviewItem = body.reviewItem as Partial<ReviewFeedItem> | undefined;
      if (!reviewItem?.text || reviewItem.rating == null) {
        return NextResponse.json(
          { success: false, error: "missing_review_item" },
          { status: 400 },
        );
      }

      const review: ReviewFeedItem = {
        id: reviewItem.id ?? "review_live",
        orgId: profile.orgId,
        businessId: profile.id,
        source: reviewItem.source === "easy" ? "easy" : "google",
        externalId: reviewItem.externalId ?? "live",
        rating: reviewItem.rating,
        text: reviewItem.text,
        authorName: reviewItem.authorName,
        createdAt: reviewItem.createdAt ?? new Date().toISOString(),
        provenance: reviewItem.provenance ?? {
          method: "api",
          fetchedAt: new Date().toISOString(),
        },
      };

      const result = await runReviewPipeline({
        profile,
        locale,
        review,
        preset: body.preset as ReviewReplyPreset | undefined,
        request: req,
      });

      return NextResponse.json({
        success: true,
        mode: body.mode,
        source: result.source,
        data: result.data.presets,
        draft: result.data.draft,
      });
    }

    return NextResponse.json(
      { success: false, error: "unsupported_mode" },
      { status: 400 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "agent_failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
