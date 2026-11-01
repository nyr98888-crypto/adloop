/** Israeli Privacy Protection Law–oriented retention defaults */
export const RETENTION = {
  voiceBlobDays: 30,
  capturePhotoDays: 90,
  generationAuditDays: 60,
  oauthTokenIdleDays: 180,
} as const;

export function isExpired(createdAt: Date, days: number): boolean {
  const ms = days * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt.getTime() > ms;
}

export function retentionPolicySummary() {
  return {
    ...RETENTION,
    note: "Voice and photo blobs should be deleted via Blob lifecycle / cron when expired.",
  };
}
