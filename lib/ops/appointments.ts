import type { Locale } from "@/lib/domain/types";
import { isolatePhone, isolateUrl } from "@/lib/i18n/bidi";

export type AppointmentClient = {
  id: string;
  name: string;
  phone: string;
  service: string;
  address?: string;
  /** ISO last completed visit for recall engine */
  lastVisitAt?: string;
};

export type OpsAppointment = {
  id: string;
  client: AppointmentClient;
  service: string;
  startsAt: string;
  endsAt: string;
  address?: string;
  wazeQuery?: string;
};

const NOTES_KEY = "ols_client_notes_v1";

export function loadClientNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveClientNote(clientId: string, note: string) {
  if (typeof window === "undefined") return;
  const all = loadClientNotes();
  all[clientId] = note;
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
}

/** Trade → recall cadence in days */
export function recallDaysForTrade(trade: string): number {
  const t = trade.toLowerCase();
  if (
    /ציפורן|שיער|מספרה|יופי|nail|hair|beauty|salon|קוסמטי/.test(t)
  ) {
    return 28; // ~4 weeks
  }
  if (/דיטיילינג|רכב|garage|detail|רכב/.test(t)) {
    return 90;
  }
  // plumbing / handyman / default
  return 90;
}

export function buildDemoAppointments(locale: Locale): OpsAppointment[] {
  const now = new Date();

  const nextStart = new Date(now);
  nextStart.setHours(now.getHours() + 1, 30, 0, 0);
  const nextEnd = new Date(nextStart);
  nextEnd.setHours(nextStart.getHours() + 1);

  const recentEnd = new Date(now);
  recentEnd.setMinutes(recentEnd.getMinutes() - 45);
  const recentStart = new Date(recentEnd);
  recentStart.setHours(recentEnd.getHours() - 1);

  const recallVisit = new Date(now);
  recallVisit.setDate(recallVisit.getDate() - 95);

  if (locale === "he") {
    return [
      {
        id: "appt_next",
        client: {
          id: "cli_dana",
          name: "דנה כהן",
          phone: "052-5551234",
          service: "תיקון דוד שמש",
          address: "הרצל 12, רעננה",
        },
        service: "תיקון דוד שמש",
        startsAt: nextStart.toISOString(),
        endsAt: nextEnd.toISOString(),
        address: "הרצל 12, רעננה",
        wazeQuery: "הרצל 12 רעננה",
      },
      {
        id: "appt_recent",
        client: {
          id: "cli_yossi",
          name: "יוסי לוי",
          phone: "054-7778899",
          service: "תיקון נזילה",
          address: "סוקולוב 8, הרצליה",
          lastVisitAt: recentEnd.toISOString(),
        },
        service: "תיקון נזילה",
        startsAt: recentStart.toISOString(),
        endsAt: recentEnd.toISOString(),
        address: "סוקולוב 8, הרצליה",
        wazeQuery: "סוקולוב 8 הרצליה",
      },
      {
        id: "appt_recall",
        client: {
          id: "cli_mira",
          name: "מירה אברהם",
          phone: "050-1112233",
          service: "טיפול תקופתי",
          lastVisitAt: recallVisit.toISOString(),
        },
        service: "טיפול תקופתי",
        startsAt: recallVisit.toISOString(),
        endsAt: new Date(recallVisit.getTime() + 3600000).toISOString(),
        address: "ויצמן 3, כפר סבא",
        wazeQuery: "ויצמן 3 כפר סבא",
      },
    ];
  }

  return [
    {
      id: "appt_next",
      client: {
        id: "cli_dana",
        name: "Dana Cohen",
        phone: "052-5551234",
        service: "Solar boiler repair",
        address: "Herzl 12, Ra'anana",
      },
      service: "Solar boiler repair",
      startsAt: nextStart.toISOString(),
      endsAt: nextEnd.toISOString(),
      address: "Herzl 12, Ra'anana",
      wazeQuery: "Herzl 12 Ra'anana",
    },
    {
      id: "appt_recent",
      client: {
        id: "cli_yossi",
        name: "Yossi Levi",
        phone: "054-7778899",
        service: "Leak repair",
        lastVisitAt: recentEnd.toISOString(),
      },
      service: "Leak repair",
      startsAt: recentStart.toISOString(),
      endsAt: recentEnd.toISOString(),
      address: "Sokolov 8, Herzliya",
      wazeQuery: "Sokolov 8 Herzliya",
    },
    {
      id: "appt_recall",
      client: {
        id: "cli_mira",
        name: "Mira Avraham",
        phone: "050-1112233",
        service: "Maintenance visit",
        lastVisitAt: recallVisit.toISOString(),
      },
      service: "Maintenance visit",
      startsAt: recallVisit.toISOString(),
      endsAt: new Date(recallVisit.getTime() + 3600000).toISOString(),
      address: "Weizmann 3, Kfar Saba",
      wazeQuery: "Weizmann 3 Kfar Saba",
    },
  ];
}

export function nextUpcoming(appts: OpsAppointment[]): OpsAppointment | null {
  const now = Date.now();
  return (
    appts
      .filter((a) => new Date(a.startsAt).getTime() >= now - 5 * 60_000)
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )[0] ?? null
  );
}

export function recentlyEnded(
  appts: OpsAppointment[],
  withinHours = 2,
): OpsAppointment | null {
  const now = Date.now();
  const windowMs = withinHours * 3600_000;
  return (
    appts
      .filter((a) => {
        const end = new Date(a.endsAt).getTime();
        return end <= now && now - end <= windowMs;
      })
      .sort(
        (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
      )[0] ?? null
  );
}

export function dueForRecall(
  appts: OpsAppointment[],
  trade: string,
): OpsAppointment | null {
  const days = recallDaysForTrade(trade);
  const cutoff = Date.now() - days * 86400_000;
  return (
    appts
      .filter((a) => {
        const last = a.client.lastVisitAt
          ? new Date(a.client.lastVisitAt).getTime()
          : new Date(a.endsAt).getTime();
        return last <= cutoff;
      })
      .sort(
        (a, b) =>
          new Date(a.client.lastVisitAt ?? a.endsAt).getTime() -
          new Date(b.client.lastVisitAt ?? b.endsAt).getTime(),
      )[0] ?? null
  );
}

export function waDeepLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("972")
    ? digits
    : digits.startsWith("0")
      ? `972${digits.slice(1)}`
      : digits;
  return `whatsapp://send?phone=${normalized}&text=${encodeURIComponent(text)}`;
}

export function waWebFallback(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("972")
    ? digits
    : digits.startsWith("0")
      ? `972${digits.slice(1)}`
      : digits;
  return isolateUrl(
    `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`,
  );
}

export function onMyWayMessage(
  locale: Locale,
  businessName: string,
  clientName: string,
): string {
  if (locale === "he") {
    return `שלום ${clientName}, כאן ${businessName} 👋\nאני בדרך אליך — הגעה משוערת בעוד כ־20 דקות.`;
  }
  return `Hi ${clientName}, this is ${businessName} 👋\nI'm on my way — ETA about 20 minutes.`;
}

/** Decode percent-encoding for clean display; keep valid URL for clicking. */
export function cleanDisplayUrl(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

export function reviewRequestMessage(
  locale: Locale,
  businessName: string,
  clientName: string | null | undefined,
  googleUrl: string,
  easyUrl?: string,
): string {
  const g = isolateUrl(cleanDisplayUrl(googleUrl));
  const e = easyUrl ? isolateUrl(cleanDisplayUrl(easyUrl)) : "";
  const name = clientName?.trim() || "";

  if (locale === "he") {
    const greet = name
      ? `היי ${name}! תודה רבה שבחרת בי / ב${businessName} 🌟`
      : `היי! תודה שבחרת בנו 🌟\nשלום רב מ${businessName}!`;
    return `${greet}\nנשמח אם תשתפו חוות דעת קצרה:\nGoogle: ${g}${e ? `\nאיזי: ${e}` : ""}\nתודה רבה!`;
  }

  const greet = name
    ? `Hi ${name}! Thanks so much for choosing ${businessName} 🌟`
    : `Hi! Thanks for choosing us 🌟\nGreetings from ${businessName}!`;
  return `${greet}\nWe'd love a short review:\nGoogle: ${g}${e ? `\nEasy: ${e}` : ""}\nThank you!`;
}

export function recallMessage(
  locale: Locale,
  businessName: string,
  clientName: string,
  service: string,
  phone: string,
): string {
  const p = isolatePhone(phone);
  if (locale === "he") {
    return `שלום ${clientName}, כאן ${businessName}.\nעברו כמה שבועות מאז ${service} — רוצים לתאם תור לתחזוקה?\nניתן להשיב כאן או להתקשר ${p}`;
  }
  return `Hi ${clientName}, this is ${businessName}.\nIt's been a while since ${service} — want to book a maintenance visit?\nReply here or call ${p}`;
}

export function wazeLink(query: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}

export function defaultReviewLinks(businessName: string) {
  // Prefer readable query strings; decode before display/WhatsApp paste
  const q = encodeURIComponent(businessName);
  return {
    google: cleanDisplayUrl(
      `https://search.google.com/local/writereview?placeid=DEMO_${q}`,
    ),
    easy: cleanDisplayUrl(`https://www.easy.co.il/search?q=${q}`),
  };
}

export function openWhatsApp(phone: string, text: string) {
  const deep = waDeepLink(phone, text);
  const web = waWebFallback(phone, text);
  try {
    window.location.href = deep;
    setTimeout(() => {
      window.open(web, "_blank");
    }, 600);
  } catch {
    window.open(web, "_blank");
  }
}
