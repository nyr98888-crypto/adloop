export type AspectPreset = "9:16" | "1:1" | "4:5";

export interface UpscalerProvider {
  name: string;
  upscale(input: {
    blobKey: string;
    target: AspectPreset;
  }): Promise<{ blobKey: string }>;
}

/** Solo tier / default — no upscale */
export class NoopUpscaler implements UpscalerProvider {
  name = "noop";
  async upscale(input: { blobKey: string; target: AspectPreset }) {
    return { blobKey: input.blobKey };
  }
}

/** Growth+ adapter stub for FAL */
export class FalUpscaler implements UpscalerProvider {
  name = "fal";
  async upscale(input: { blobKey: string; target: AspectPreset }) {
    // Plug-in point: call FAL when FAL_KEY is configured
    if (!process.env.FAL_KEY) {
      return { blobKey: input.blobKey };
    }
    return { blobKey: `${input.blobKey}:upscaled:${input.target}` };
  }
}

export class TogetherUpscaler implements UpscalerProvider {
  name = "together";
  async upscale(input: { blobKey: string; target: AspectPreset }) {
    if (!process.env.TOGETHER_API_KEY) {
      return { blobKey: input.blobKey };
    }
    return { blobKey: `${input.blobKey}:together:${input.target}` };
  }
}

export function getUpscaler(tier: "solo" | "growth" | "agency"): UpscalerProvider {
  if (tier === "solo") return new NoopUpscaler();
  if (process.env.FAL_KEY) return new FalUpscaler();
  if (process.env.TOGETHER_API_KEY) return new TogetherUpscaler();
  return new NoopUpscaler();
}

export const ASPECT_TARGETS: AspectPreset[] = ["9:16", "1:1", "4:5"];

export async function processCaptureAssets(input: {
  blobKey: string;
  tier: "solo" | "growth" | "agency";
}) {
  const upscaler = getUpscaler(input.tier);
  const variants = [];
  for (const target of ASPECT_TARGETS) {
    const result = await upscaler.upscale({
      blobKey: input.blobKey,
      target,
    });
    variants.push({ target, blobKey: result.blobKey, upscaler: upscaler.name });
  }
  return variants;
}
