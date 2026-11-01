import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/locale";

export default async function OnboardingPage() {
  const locale = await resolveLocale();
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-brand-primary">One Loop Social</h1>
      <p className="text-brand-accent/80">
        {locale === "he"
          ? "הגדרת פרופיל עסק אחד · חיבור רשתות · פוסט ראשון ב־2–3 דקות"
          : "Set one business profile · connect networks · first post in 2–3 minutes"}
      </p>
      <div className="flex gap-3">
        <Link
          href="/d"
          className="rounded-xl bg-brand-primary px-4 py-3 font-semibold text-white"
        >
          {locale === "he" ? "דסקטופ" : "Desktop"}
        </Link>
        <Link
          href="/m"
          className="rounded-xl border border-brand-sky px-4 py-3 font-semibold text-brand-primary"
        >
          {locale === "he" ? "מובייל" : "Mobile"}
        </Link>
      </div>
    </main>
  );
}
