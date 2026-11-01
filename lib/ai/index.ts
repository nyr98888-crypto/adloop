/**
 * Phase 0 scaffold entry — zero-hallucination pipeline lives here.
 * Free-form unstructured completions are prohibited for publish paths.
 */
export { generateGroundedPost } from "@/lib/ai/pipeline";
export { generateReviewReply } from "@/lib/ai/review-reply";
export { buildGroundingContext } from "@/lib/ai/grounding";
export * from "@/lib/ai/schemas";
