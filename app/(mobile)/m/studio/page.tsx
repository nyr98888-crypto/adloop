import { StudioDeck } from "@/components/mobile/StudioDeck";
import { resolveLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function MobileStudioPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-brand-accent">{t.nav.studio}</h1>
      <StudioDeck locale={locale} />
    </div>
  );
}
