import { NextResponse } from "next/server";
import { generateGroundedPost } from "@/lib/ai/pipeline";
import { extractFacts } from "@/lib/ai/stage1-extract";
import { coachingQuestions, resolveAiMode } from "@/lib/ai/coach";
import { demoAccounts, demoProfile, savePost } from "@/lib/demo/store";
import type {
  Locale,
  Platform,
  UserInputPayload,
} from "@/lib/domain/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    promptText?: string;
    transcription?: string;
    locale?: Locale;
    seedGap?: UserInputPayload["seedGap"];
    forceAuto?: boolean;
    enabledPlatforms?: Platform[];
  };

  const locale = body.locale ?? demoProfile.localeDefault;
  const userInput: UserInputPayload = {
    promptText: body.promptText,
    transcription: body.transcription,
    seedGap: body.seedGap,
  };
  const raw = `${body.transcription ?? ""}\n${body.promptText ?? ""}`.trim();
  const facts = extractFacts(demoProfile, userInput);
  const mode = body.forceAuto ? "auto" : resolveAiMode(facts, raw);

  const accounts =
    body.enabledPlatforms?.length
      ? demoAccounts
          .map((a) =>
            body.enabledPlatforms!.includes(a.platform)
              ? { ...a, enabled: true, status: "active" as const }
              : { ...a, enabled: false },
          )
          .filter((a) => a.enabled)
      : demoAccounts.filter((a) => a.enabled);

  const post = generateGroundedPost({
    profile: demoProfile,
    enabledAccounts: accounts,
    locale,
    userInput,
  });
  savePost(post);

  if (mode === "coached") {
    return NextResponse.json({
      post,
      mode: "coached",
      questions: coachingQuestions(facts, locale),
    });
  }

  return NextResponse.json({ post, mode: "auto" });
}
