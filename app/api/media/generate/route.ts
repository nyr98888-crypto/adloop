import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  trade: z.string().optional(),
  aspectRatio: z.enum(["1:1", "9:16", "16:9"]).default("1:1"),
});

const NEGATIVE =
  "cartoon, anime, 3d render, deformed hands, extra fingers, blurry, unrealistic, watermark";

function imageSizeForAspect(aspect: "1:1" | "9:16" | "16:9") {
  switch (aspect) {
    case "9:16":
      return { width: 768, height: 1344, fal: "portrait_16_9" as const };
    case "16:9":
      return { width: 1344, height: 768, fal: "landscape_16_9" as const };
    default:
      return { width: 1024, height: 1024, fal: "square_hd" as const };
  }
}

/**
 * POST /api/media/generate
 * Uses FAL_KEY (fal-ai/flux-realism) or TOGETHER_API_KEY as fallback.
 * Keys are server-only and never returned to the client.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "invalid_request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { prompt, trade, aspectRatio } = parsed.data;
    const size = imageSizeForAspect(aspectRatio);
    const fullPrompt = [
      trade ? `Professional photo for a ${trade} local business.` : null,
      "Photorealistic, natural lighting, documentary style, Israeli local business context.",
      prompt,
    ]
      .filter(Boolean)
      .join(" ");

    const falKey = process.env.FAL_KEY?.trim();
    const togetherKey = process.env.TOGETHER_API_KEY?.trim();

    if (falKey) {
      const res = await fetch("https://fal.run/fal-ai/flux-realism", {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          negative_prompt: NEGATIVE,
          image_size: size.fal,
          num_images: 1,
          enable_safety_checker: true,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return NextResponse.json(
          {
            success: false,
            error: "fal_failed",
            status: res.status,
            detail: errText.slice(0, 300),
          },
          { status: 502 },
        );
      }

      const data = (await res.json()) as {
        images?: Array<{ url?: string }>;
        image?: { url?: string };
      };
      const url = data.images?.[0]?.url ?? data.image?.url;
      if (!url) {
        return NextResponse.json(
          { success: false, error: "fal_empty_image" },
          { status: 502 },
        );
      }
      return NextResponse.json({
        success: true,
        provider: "fal",
        url,
        aspectRatio,
      });
    }

    if (togetherKey) {
      const res = await fetch(
        "https://api.together.xyz/v1/images/generations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${togetherKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-schnell",
            prompt: `${fullPrompt}. Avoid: ${NEGATIVE}`,
            width: size.width,
            height: size.height,
            steps: 4,
            n: 1,
          }),
        },
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return NextResponse.json(
          {
            success: false,
            error: "together_failed",
            status: res.status,
            detail: errText.slice(0, 300),
          },
          { status: 502 },
        );
      }

      const data = (await res.json()) as {
        data?: Array<{ url?: string; b64_json?: string }>;
      };
      const url = data.data?.[0]?.url;
      if (!url) {
        return NextResponse.json(
          { success: false, error: "together_empty_image" },
          { status: 502 },
        );
      }
      return NextResponse.json({
        success: true,
        provider: "together",
        url,
        aspectRatio,
      });
    }

    // Demo placeholder when no keys — still returns a usable image URL
    const placeholder = `https://placehold.co/${size.width}x${size.height}/0077F6/FFFFFF/png?text=${encodeURIComponent(
      trade || "One+Loop",
    )}`;
    return NextResponse.json({
      success: true,
      provider: "placeholder",
      url: placeholder,
      aspectRatio,
      warning: "missing_fal_or_together_key",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "media_generate_failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
