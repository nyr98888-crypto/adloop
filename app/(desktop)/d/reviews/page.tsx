import { ReviewCard } from "@/components/desktop/reviews/ReviewCard";
import { ReviewMagnetHeader } from "@/components/desktop/reviews/ReviewMagnetHeader";
import { demoReviews } from "@/lib/demo/store";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/locale";

export default async function ReviewsPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-brand-accent">{t.nav.reviews}</h1>
      <p className="text-sm text-brand-accent/70">
        Google Business · Easy.co.il
      </p>
      <ReviewMagnetHeader locale={locale} />
      <div className="grid gap-4 lg:grid-cols-2">
        {demoReviews.map((r) => (
          <ReviewCard key={r.id} review={r} locale={locale} />
        ))}
      </div>
    </div>
  );
}
