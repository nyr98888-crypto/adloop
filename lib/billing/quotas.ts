import type { PlanTier } from "@/lib/domain/types";

/** Daily official publication quotas (Redis-backed in production) */
const DAILY_OFFICIAL_QUOTA: Record<PlanTier, number> = {
  solo: 10,
  growth: 50,
  agency: 500,
};

const memoryCounters = new Map<string, { day: string; count: number }>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getOfficialPublishQuota(tier: PlanTier): number {
  return DAILY_OFFICIAL_QUOTA[tier];
}

export function assertWithinQuota(orgId: string, tier: PlanTier): void {
  const key = `${orgId}:${todayKey()}`;
  const current = memoryCounters.get(key) ?? { day: todayKey(), count: 0 };
  if (current.count >= getOfficialPublishQuota(tier)) {
    throw new Error("daily_publication_quota_exceeded");
  }
}

export function incrementQuota(orgId: string): void {
  const key = `${orgId}:${todayKey()}`;
  const current = memoryCounters.get(key) ?? { day: todayKey(), count: 0 };
  memoryCounters.set(key, { ...current, count: current.count + 1 });
}
