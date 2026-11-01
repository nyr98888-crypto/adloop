import { PublishActions } from "@/components/mobile/PublishActions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/locale";

export default async function MobilePublishPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-brand-accent">{t.post.publication}</h1>
      <PublishActions
        locale={locale}
        labels={{
          publishAll: t.post.publishAll,
          copyAndOpen: t.post.copyAndOpen,
        }}
      />
    </div>
  );
}
