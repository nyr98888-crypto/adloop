import { generateGroundedPost } from "@/lib/ai/pipeline";
import { processCaptureAssets } from "@/lib/media/pipeline";
import type {
  BusinessProfile,
  ConnectedAccount,
  Locale,
  PlanTier,
  UserInputPayload,
} from "@/lib/domain/types";

export async function processCaptureWorkflow(input: {
  profile: BusinessProfile;
  accounts: ConnectedAccount[];
  userInput: UserInputPayload;
  locale: Locale;
  blobKey?: string;
  tier?: PlanTier;
}) {
  const mediaVariants = input.blobKey
    ? await processCaptureAssets({
        blobKey: input.blobKey,
        tier: input.tier ?? "solo",
      })
    : [];

  const post = generateGroundedPost({
    profile: input.profile,
    userInput: input.userInput,
    enabledAccounts: input.accounts,
    locale: input.locale,
  });

  if (mediaVariants.length) {
    const primary = mediaVariants[0]?.blobKey;
    if (primary) {
      post.variants = post.variants.map((v) => ({
        ...v,
        mediaAssetIds: v.mediaAssetIds.length ? v.mediaAssetIds : [primary],
      }));
    }
  }

  return { post, mediaVariants };
}
