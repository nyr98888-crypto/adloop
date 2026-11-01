import { MobileActionCanvas } from "@/components/mobile/MobileActionCanvas";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/locale";
import { demoProfile } from "@/lib/demo/store";

export default async function MobileCapturePage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="rounded-2xl border border-[#BAE6FD] bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{demoProfile.name}</h1>
        <p className="text-sm text-slate-500">
          {demoProfile.trade} · {demoProfile.location.city}
        </p>
      </section>
      <MobileActionCanvas
        locale={locale}
        labels={{
          voice: t.capture.voice,
          photo: t.capture.photo,
          generate: t.capture.generate,
          copyAndOpen: t.post.copyAndOpen,
        }}
      />
    </div>
  );
}
