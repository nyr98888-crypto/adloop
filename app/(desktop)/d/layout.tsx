import { resolveLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DesktopShell } from "@/components/desktop/DesktopShell";
import { demoProfile } from "@/lib/demo/store";

export default async function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await resolveLocale();
  const t = getDictionary(locale);

  return (
    <DesktopShell
      locale={locale}
      businessName={demoProfile.name}
      labels={{
        name: t.app.name,
        tagline: t.app.tagline,
        home: t.nav.home,
        dashboard: t.nav.dashboard,
        calendar: t.nav.calendar,
        reviews: t.nav.reviews,
        analytics: t.nav.analytics,
        settings: t.nav.settings,
        mobile: locale === "he" ? "מעבר למובייל" : "Switch to mobile",
      }}
    >
      {children}
    </DesktopShell>
  );
}
