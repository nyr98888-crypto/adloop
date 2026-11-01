"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ChannelProvider } from "@/context/ChannelContext";

/**
 * App-wide providers: Channel store always; Clerk when keys present.
 */
export function Providers({
  children,
  clerkEnabled,
}: {
  children: React.ReactNode;
  clerkEnabled: boolean;
}) {
  const body = <ChannelProvider>{children}</ChannelProvider>;
  if (!clerkEnabled) return body;
  return <ClerkProvider>{body}</ClerkProvider>;
}
