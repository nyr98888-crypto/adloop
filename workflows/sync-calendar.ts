import {
  AppleIcsAdapter,
  detectGaps,
  GoogleCalendarAdapter,
} from "@/lib/calendar/adapters";
import type { DiaryEvent, DiaryGap } from "@/lib/domain/types";

export async function syncCalendarWorkflow(input: {
  businessId: string;
  googleAccountRef?: string;
  appleIcsUrl?: string;
}): Promise<{ events: DiaryEvent[]; gaps: DiaryGap[] }> {
  const events: DiaryEvent[] = [];

  if (input.googleAccountRef) {
    const google = new GoogleCalendarAdapter();
    const gEvents = await google.sync(input.googleAccountRef);
    events.push(
      ...gEvents.map((e) => ({ ...e, businessId: input.businessId })),
    );
  }

  if (input.appleIcsUrl) {
    const apple = new AppleIcsAdapter();
    const aEvents = await apple.sync(input.appleIcsUrl);
    events.push(
      ...aEvents.map((e) => ({ ...e, businessId: input.businessId })),
    );
  }

  const gaps = detectGaps({
    businessId: input.businessId,
    events,
    day: new Date(),
  });

  return { events, gaps };
}
