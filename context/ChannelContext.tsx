"use client";

/**
 * Channel hooks — backed by multi-tenant BusinessContext.
 * Kept for existing imports (`useChannels` / `ChannelProvider`).
 */
import { BusinessProvider, useBusiness } from "@/context/BusinessContext";

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  return <BusinessProvider>{children}</BusinessProvider>;
}

export function useChannels() {
  const {
    accounts,
    enabledAccounts,
    profile,
    setEnabled,
    setMode,
    setWebsiteUrl,
    hydrated,
  } = useBusiness();

  return {
    accounts,
    enabledAccounts,
    profile,
    setEnabled,
    setMode,
    setWebsiteUrl,
    hydrated,
  };
}
