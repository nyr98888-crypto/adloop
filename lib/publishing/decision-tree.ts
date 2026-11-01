import type {
  ConnectedAccount,
  ConnectionMode,
  PostPayload,
} from "@/lib/domain/types";

export type PublishRoute =
  | { kind: "official_api"; account: ConnectedAccount }
  | { kind: "manual_deeplink"; account: ConnectedAccount; reason?: string };

/**
 * Per-account routing: Official API vs Manual Copy & Deep Link.
 */
export function routeAccount(account: ConnectedAccount): PublishRoute {
  if (
    account.mode === "official_api" &&
    account.status === "active" &&
    (account.scopes?.length ?? 0) > 0
  ) {
    return { kind: "official_api", account };
  }

  if (account.mode === "official_api" && account.status === "degraded") {
    return {
      kind: "manual_deeplink",
      account: { ...account, mode: "manual_deeplink" },
      reason: "degraded_token",
    };
  }

  return { kind: "manual_deeplink", account };
}

export function buildPublicationPlan(
  accounts: ConnectedAccount[],
): PostPayload["publicationPlan"] {
  return accounts
    .filter((a) => a.enabled && a.status !== "disconnected")
    .map((a) => {
      const route = routeAccount(a);
      return {
        connectedAccountId: a.id,
        mode: route.kind as ConnectionMode,
        status: "queued" as const,
      };
    });
}

export interface ManualPackage {
  connectedAccountId: string;
  platform: ConnectedAccount["platform"];
  caption: string;
  deepLink?: string;
  webComposerUrl?: string;
  clipboardText: string;
}

export function buildManualPackage(
  account: ConnectedAccount,
  caption: string,
): ManualPackage {
  const encoded = encodeURIComponent(caption);
  const deepLink = account.deepLinkTemplate
    ? account.deepLinkTemplate.replace("{text}", encoded)
    : undefined;

  return {
    connectedAccountId: account.id,
    platform: account.platform,
    caption,
    deepLink,
    webComposerUrl: account.webComposerUrl,
    clipboardText: caption,
  };
}
