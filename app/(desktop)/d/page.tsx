import { HomeCockpit } from "@/components/desktop/home/HomeCockpit";
import { resolveLocale } from "@/lib/i18n/locale";
import {
  demoGaps,
  demoRecentPublications,
  demoReviews,
} from "@/lib/demo/store";

export default async function DesktopHomePage() {
  const locale = await resolveLocale();
  const unanswered = demoReviews.filter((r) => !r.reply);

  return (
    <HomeCockpit
      locale={locale}
      gaps={demoGaps}
      unansweredReviews={unanswered}
      daysSinceLastPost={4}
      postsThisWeek={2}
      recentPublications={demoRecentPublications}
    />
  );
}
