"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  BusinessProfile,
  ConnectedAccount,
  ConnectionMode,
  Platform,
} from "@/lib/domain/types";
import {
  ACTIVE_BUSINESS_KEY,
  BUSINESS_STORAGE_KEY,
  CHANNEL_STORAGE_KEY,
  LEGACY_BUSINESS_KEY,
  LEGACY_CHANNEL_KEY,
  buildDefaultAccounts,
  createEmptyBusiness,
  defaultBusinesses,
} from "@/lib/store/channelDefaults";

type ChannelsMap = Record<string, ConnectedAccount[]>;

type BusinessContextValue = {
  businesses: BusinessProfile[];
  activeBusinessId: string;
  /** Active business profile (alias: activeBusiness) */
  profile: BusinessProfile;
  activeBusiness: BusinessProfile;
  accounts: ConnectedAccount[];
  enabledAccounts: ConnectedAccount[];
  switchBusiness: (id: string) => void;
  addBusiness: (profile: BusinessProfile | Partial<BusinessProfile>) => string;
  updateBusiness: (id: string, patch: Partial<BusinessProfile>) => void;
  deleteBusiness: (id: string) => void;
  setEnabled: (platform: Platform, enabled: boolean) => void;
  setMode: (platform: Platform, mode: ConnectionMode) => void;
  setWebsiteUrl: (url: string) => void;
  updateActiveProfile: (patch: Partial<BusinessProfile>) => void;
  hydrated: boolean;
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

/** Merge any missing catalog platforms into a business channel list (all 11). */
function mergeAccountCatalog(
  existing: ConnectedAccount[] | undefined,
  business: BusinessProfile,
): ConnectedAccount[] {
  const defaults = buildDefaultAccounts(business.id, business.orgId);
  if (!existing?.length) return defaults;
  const byPlatform = new Map(existing.map((a) => [a.platform, a]));
  return defaults.map((d) => {
    const prev = byPlatform.get(d.platform);
    if (!prev) return d;
    return {
      ...d,
      ...prev,
      id: prev.id || d.id,
      businessId: business.id,
      orgId: business.orgId,
      platform: d.platform,
    };
  });
}

function ensureChannels(map: ChannelsMap, business: BusinessProfile): ChannelsMap {
  return {
    ...map,
    [business.id]: mergeAccountCatalog(map[business.id], business),
  };
}

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const defaults = defaultBusinesses();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(defaults);
  const [activeBusinessId, setActiveBusinessId] = useState(defaults[0].id);
  const [channelsByBusiness, setChannelsByBusiness] = useState<ChannelsMap>(() => {
    const map: ChannelsMap = {};
    for (const b of defaults) {
      map[b.id] = buildDefaultAccounts(b.id, b.orgId);
    }
    return map;
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Defer so hydration setState is not synchronous inside the effect body.
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        let nextBusinesses = defaults;
        let nextActive = defaults[0].id;
        let nextChannels: ChannelsMap = {};

        const rawBiz = localStorage.getItem(BUSINESS_STORAGE_KEY);
        if (rawBiz) {
          const parsed = JSON.parse(rawBiz) as BusinessProfile[];
          if (Array.isArray(parsed) && parsed.length) nextBusinesses = parsed;
        } else {
          const legacy = localStorage.getItem(LEGACY_BUSINESS_KEY);
          if (legacy) {
            const parsed = JSON.parse(legacy) as BusinessProfile;
            nextBusinesses = [{ ...defaults[0], ...parsed }];
          }
        }

        const rawActive = localStorage.getItem(ACTIVE_BUSINESS_KEY);
        if (rawActive && nextBusinesses.some((b) => b.id === rawActive)) {
          nextActive = rawActive;
        } else {
          nextActive = nextBusinesses[0]?.id ?? defaults[0].id;
        }

        const rawCh = localStorage.getItem(CHANNEL_STORAGE_KEY);
        if (rawCh) {
          const parsed = JSON.parse(rawCh) as ChannelsMap;
          if (parsed && typeof parsed === "object") nextChannels = parsed;
        } else {
          const legacyCh = localStorage.getItem(LEGACY_CHANNEL_KEY);
          if (legacyCh) {
            const parsed = JSON.parse(legacyCh) as ConnectedAccount[];
            if (Array.isArray(parsed) && parsed.length) {
              nextChannels[nextActive] = parsed.map((a) => ({
                ...a,
                businessId: nextActive,
              }));
            }
          }
        }

        for (const b of nextBusinesses) {
          nextChannels = ensureChannels(nextChannels, b);
        }

        let mergedChannels = nextChannels;
        for (const b of nextBusinesses) {
          mergedChannels = ensureChannels(mergedChannels, b);
        }

        setBusinesses(nextBusinesses);
        setActiveBusinessId(nextActive);
        setChannelsByBusiness(mergedChannels);
      } catch {
        /* ignore corrupt storage */
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(businesses));
  }, [businesses, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ACTIVE_BUSINESS_KEY, activeBusinessId);
  }, [activeBusinessId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CHANNEL_STORAGE_KEY, JSON.stringify(channelsByBusiness));
  }, [channelsByBusiness, hydrated]);

  const profile = useMemo(() => {
    return (
      businesses.find((b) => b.id === activeBusinessId) ??
      businesses[0] ??
      defaults[0]
    );
  }, [businesses, activeBusinessId, defaults]);

  const accounts = useMemo(() => {
    return mergeAccountCatalog(channelsByBusiness[profile.id], profile);
  }, [channelsByBusiness, profile]);

  const enabledAccounts = useMemo(
    () => accounts.filter((a) => a.enabled),
    [accounts],
  );

  const switchBusiness = useCallback((id: string) => {
    setActiveBusinessId(id);
  }, []);

  const addBusiness = useCallback(
    (input: BusinessProfile | Partial<BusinessProfile>) => {
      const full =
        "id" in input && input.id && "orgId" in input && input.orgId
          ? (input as BusinessProfile)
          : createEmptyBusiness({
              name: input.name || "עסק חדש",
              trade: input.trade || "שירותים",
              phone: input.phone || "050-0000000",
              ...input,
            });
      setBusinesses((prev) => [...prev, full]);
      setChannelsByBusiness((prev) =>
        ensureChannels(prev, full),
      );
      setActiveBusinessId(full.id);
      return full.id;
    },
    [],
  );

  const updateBusiness = useCallback(
    (id: string, patch: Partial<BusinessProfile>) => {
      setBusinesses((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const next = { ...b, ...patch };
          if (patch.location) {
            next.location = { ...b.location, ...patch.location };
          }
          return next;
        }),
      );
    },
    [],
  );

  const deleteBusiness = useCallback((id: string) => {
    setBusinesses((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((b) => b.id !== id);
      setActiveBusinessId((active) =>
        active === id ? next[0]?.id ?? active : active,
      );
      return next;
    });
    setChannelsByBusiness((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const patchActiveAccounts = useCallback(
    (updater: (prev: ConnectedAccount[]) => ConnectedAccount[]) => {
      setChannelsByBusiness((map) => {
        const current = mergeAccountCatalog(map[activeBusinessId], profile);
        return { ...map, [activeBusinessId]: updater(current) };
      });
    },
    [activeBusinessId, profile],
  );

  const setEnabled = useCallback(
    (platform: Platform, enabled: boolean) => {
      patchActiveAccounts((prev) => {
        const merged = mergeAccountCatalog(prev, profile);
        return merged.map((a) =>
          a.platform === platform
            ? {
                ...a,
                enabled,
                status: enabled ? "active" : "disconnected",
              }
            : a,
        );
      });
    },
    [patchActiveAccounts, profile],
  );

  const setMode = useCallback(
    (platform: Platform, mode: ConnectionMode) => {
      patchActiveAccounts((prev) => {
        const merged = mergeAccountCatalog(prev, profile);
        return merged.map((a) =>
          a.platform === platform ? { ...a, mode } : a,
        );
      });
    },
    [patchActiveAccounts, profile],
  );

  const updateActiveProfile = useCallback(
    (patch: Partial<BusinessProfile>) => {
      updateBusiness(activeBusinessId, patch);
    },
    [activeBusinessId, updateBusiness],
  );

  const setWebsiteUrl = useCallback(
    (url: string) => {
      updateActiveProfile({ websiteUrl: url });
    },
    [updateActiveProfile],
  );

  const value = useMemo(
    () => ({
      businesses,
      activeBusinessId,
      profile,
      activeBusiness: profile,
      accounts,
      enabledAccounts,
      switchBusiness,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      setEnabled,
      setMode,
      setWebsiteUrl,
      updateActiveProfile,
      hydrated,
    }),
    [
      businesses,
      activeBusinessId,
      profile,
      accounts,
      enabledAccounts,
      switchBusiness,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      setEnabled,
      setMode,
      setWebsiteUrl,
      updateActiveProfile,
      hydrated,
    ],
  );

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusiness must be used within BusinessProvider");
  }
  return ctx;
}
