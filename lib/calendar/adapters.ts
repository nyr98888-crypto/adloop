import type { DiaryEvent, DiaryGap } from "@/lib/domain/types";

export interface CalendarAdapter {
  id: "google" | "apple_ics" | "apple_caldav";
  sync(accountRef: string): Promise<DiaryEvent[]>;
}

/** Google Calendar API adapter (requires OAuth tokens in production) */
export class GoogleCalendarAdapter implements CalendarAdapter {
  id = "google" as const;
  async sync(_accountRef: string): Promise<DiaryEvent[]> {
    // Production: incremental syncToken via Google Calendar API
    return [];
  }
}

/** Apple ICS subscribe URL — preferred v1 (read-only, no iCloud password) */
export class AppleIcsAdapter implements CalendarAdapter {
  id = "apple_ics" as const;
  async sync(icsUrl: string): Promise<DiaryEvent[]> {
    if (!icsUrl) return [];
    try {
      const res = await fetch(icsUrl);
      if (!res.ok) return [];
      const text = await res.text();
      return parseSimpleIcs(text);
    } catch {
      return [];
    }
  }
}

function parseSimpleIcs(ics: string): DiaryEvent[] {
  const events: DiaryEvent[] = [];
  const blocks = ics.split("BEGIN:VEVENT").slice(1);
  for (const block of blocks) {
    const uid = /UID:(.+)/.exec(block)?.[1]?.trim() ?? crypto.randomUUID();
    const summary = /SUMMARY:(.+)/.exec(block)?.[1]?.trim() ?? "Event";
    const dtStart = /DTSTART[^:]*:(.+)/.exec(block)?.[1]?.trim();
    const dtEnd = /DTEND[^:]*:(.+)/.exec(block)?.[1]?.trim();
    if (!dtStart || !dtEnd) continue;
    events.push({
      id: uid,
      orgId: "unknown",
      businessId: "unknown",
      source: "apple_ics",
      externalId: uid,
      title: summary,
      startsAt: icsDateToIso(dtStart),
      endsAt: icsDateToIso(dtEnd),
      isBusy: true,
      syncedAt: new Date().toISOString(),
    });
  }
  return events;
}

function icsDateToIso(raw: string): string {
  // YYYYMMDDTHHMMSSZ or YYYYMMDD
  if (/^\d{8}T\d{6}Z$/.test(raw)) {
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    const hh = raw.slice(9, 11);
    const mm = raw.slice(11, 13);
    const ss = raw.slice(13, 15);
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`).toISOString();
  }
  if (/^\d{8}$/.test(raw)) {
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    return new Date(`${y}-${m}-${d}T00:00:00Z`).toISOString();
  }
  return new Date(raw).toISOString();
}

/** Detect open gaps from busy events within working hours */
export function detectGaps(input: {
  businessId: string;
  events: DiaryEvent[];
  day: Date;
  workStartHour?: number;
  workEndHour?: number;
}): DiaryGap[] {
  const workStart = input.workStartHour ?? 8;
  const workEnd = input.workEndHour ?? 18;
  const dayStart = new Date(input.day);
  dayStart.setHours(workStart, 0, 0, 0);
  const dayEnd = new Date(input.day);
  dayEnd.setHours(workEnd, 0, 0, 0);

  const busy = input.events
    .filter((e) => e.isBusy)
    .map((e) => ({
      start: new Date(e.startsAt).getTime(),
      end: new Date(e.endsAt).getTime(),
    }))
    .sort((a, b) => a.start - b.start);

  const gaps: DiaryGap[] = [];
  let cursor = dayStart.getTime();
  for (const b of busy) {
    if (b.start > cursor + 60 * 60 * 1000) {
      gaps.push({
        id: `gap_${cursor}`,
        businessId: input.businessId,
        windowStart: new Date(cursor).toISOString(),
        windowEnd: new Date(Math.min(b.start, dayEnd.getTime())).toISOString(),
        reason: "empty_afternoon",
        status: "open",
      });
    }
    cursor = Math.max(cursor, b.end);
  }
  if (dayEnd.getTime() > cursor + 60 * 60 * 1000) {
    gaps.push({
      id: `gap_${cursor}_end`,
      businessId: input.businessId,
      windowStart: new Date(cursor).toISOString(),
      windowEnd: dayEnd.toISOString(),
      reason: "no_bookings",
      status: "open",
    });
  }
  return gaps;
}
