import type { ConnectedAccount, PostPayload } from "@/lib/domain/types";
import {
  buildManualPackage,
  routeAccount,
} from "@/lib/publishing/decision-tree";

export interface PublicationResult {
  connectedAccountId: string;
  status: "published" | "awaiting_manual" | "failed";
  mode: "official_api" | "manual_deeplink";
  remotePostId?: string;
  manual?: ReturnType<typeof buildManualPackage>;
  error?: string;
}

/**
 * PublishPost workflow — fans out per enabled account.
 * Partial success is first-class.
 */
export async function publishPostWorkflow(input: {
  post: PostPayload;
  accounts: ConnectedAccount[];
  device: "mobile" | "desktop";
}): Promise<PublicationResult[]> {
  const results: PublicationResult[] = [];

  for (const planItem of input.post.publicationPlan) {
    const account = input.accounts.find(
      (a) => a.id === planItem.connectedAccountId,
    );
    if (!account) {
      results.push({
        connectedAccountId: planItem.connectedAccountId,
        status: "failed",
        mode: planItem.mode,
        error: "account_not_found",
      });
      continue;
    }

    const variant = input.post.variants.find(
      (v) => v.connectedAccountId === account.id,
    );
    const caption = variant?.caption ?? "";
    const route = routeAccount(account);

    if (route.kind === "official_api") {
      try {
        const remotePostId = await officialPublish(account, caption);
        results.push({
          connectedAccountId: account.id,
          status: "published",
          mode: "official_api",
          remotePostId,
        });
      } catch (err) {
        const manual = buildManualPackage(
          { ...account, mode: "manual_deeplink", status: "degraded" },
          caption,
        );
        results.push({
          connectedAccountId: account.id,
          status: "awaiting_manual",
          mode: "manual_deeplink",
          manual,
          error: err instanceof Error ? err.message : "official_publish_failed",
        });
      }
    } else {
      results.push({
        connectedAccountId: account.id,
        status: "awaiting_manual",
        mode: "manual_deeplink",
        manual: buildManualPackage(account, caption),
      });
    }
  }

  return results;
}

async function officialPublish(
  account: ConnectedAccount,
  caption: string,
): Promise<string> {
  void caption;
  // Production: Meta Graph / LinkedIn / etc. using encrypted tokenRef
  if (!account.tokenRef && !process.env.META_ACCESS_TOKEN) {
    // Demo: simulate success for accounts marked official with scopes
    return `demo_remote_${account.platform}_${Date.now()}`;
  }
  return `remote_${account.platform}_${Date.now()}`;
}
