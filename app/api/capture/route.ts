import { NextResponse } from "next/server";
import { processCaptureWorkflow } from "@/workflows/process-capture";
import {
  demoProfile,
  enabledAccounts,
  savePost,
} from "@/lib/demo/store";
import type { Locale } from "@/lib/domain/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    promptText?: string;
    transcription?: string;
    locale?: Locale;
    blobKey?: string;
  };

  const { post, mediaVariants } = await processCaptureWorkflow({
    profile: demoProfile,
    accounts: enabledAccounts(),
    locale: body.locale ?? "he",
    userInput: {
      promptText: body.promptText,
      transcription: body.transcription,
    },
    blobKey: body.blobKey,
    tier: "growth",
  });

  savePost(post);
  return NextResponse.json({ post, mediaVariants });
}
