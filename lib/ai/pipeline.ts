import { nanoid } from "nanoid";
import type {
  BusinessProfile,
  ConnectedAccount,
  Locale,
  PostPayload,
  UserInputPayload,
} from "@/lib/domain/types";
import { buildGroundingContext } from "@/lib/ai/grounding";
import { extractFacts } from "@/lib/ai/stage1-extract";
import { adaptToChannels } from "@/lib/ai/stage2-adapters";
import { auditAndVerify } from "@/lib/ai/stage3-audit";

export interface GenerateGroundedPostInput {
  profile: BusinessProfile;
  userInput: UserInputPayload;
  enabledAccounts: ConnectedAccount[];
  locale: Locale;
  orgId?: string;
  sourceCaptureId?: string;
}

/**
 * Canonical orchestrator: Stage1 → Stage2 → Stage3 → verified PostPayload.
 * Free-form unstructured completions are prohibited for publication.
 */
export function generateGroundedPost(
  input: GenerateGroundedPostInput,
): PostPayload {
  const locale = input.locale ?? input.profile.localeDefault;
  const ctx = buildGroundingContext(input.profile, input.userInput);
  const facts = extractFacts(input.profile, input.userInput);
  const drafts = adaptToChannels(
    input.profile,
    facts,
    input.enabledAccounts,
    locale,
    ctx,
  );
  const audited = auditAndVerify(drafts, facts, ctx);

  const enabled = input.enabledAccounts.filter(
    (a) => a.enabled && a.status !== "disconnected",
  );

  return {
    id: nanoid(),
    orgId: input.orgId ?? input.profile.orgId,
    businessId: input.profile.id,
    sourceCaptureId: input.sourceCaptureId ?? nanoid(),
    seedGapId: input.userInput.seedGap?.gapId,
    groundingRefs: audited.groundingRefs,
    strippedClaims: audited.strippedClaims,
    variants: audited.variants,
    whatsappCard: audited.whatsappCard,
    publicationPlan: enabled.map((a) => ({
      connectedAccountId: a.id,
      mode: a.mode,
      status: "queued" as const,
    })),
  };
}
