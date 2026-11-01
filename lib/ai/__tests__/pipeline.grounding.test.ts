import { generateGroundedPost } from "@/lib/ai/pipeline";
import { demoProfile, enabledAccounts } from "@/lib/demo/store";

function captionsContain(post: ReturnType<typeof generateGroundedPost>, needle: string) {
  return post.variants.some((v) => v.caption.includes(needle));
}

/** Run with: npx tsx lib/ai/__tests__/pipeline.grounding.test.ts */
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const accounts = enabledAccounts();

const clean = generateGroundedPost({
  profile: demoProfile,
  enabledAccounts: accounts,
  locale: "he",
  userInput: {
    promptText: "תיקנתי נזילה בכיור ברעננה היום",
  },
});

assert(clean.variants.length > 0, "expected variants");
assert(captionsContain(clean, "050-1234567") || captionsContain(clean, demoProfile.name), "must include grounded phone or name");
assert(!captionsContain(clean, "50%"), "must not invent discount");

const withInventedTemptation = generateGroundedPost({
  profile: demoProfile,
  enabledAccounts: accounts,
  locale: "he",
  userInput: {
    // User did NOT state a discount; pipeline must not add one in adapters.
    promptText: "סיימנו התקנת דוד שמש",
  },
});

assert(
  !withInventedTemptation.variants.some((v) =>
    /\d+\s*%|אחריות לכל החיים|לקוח מפורסם/.test(v.caption),
  ),
  "must not invent warranty/discount/famous client",
);

const withExplicitDiscount = generateGroundedPost({
  profile: demoProfile,
  enabledAccounts: accounts,
  locale: "he",
  userInput: {
    promptText: "מבצע היום הנחה 10% על פתיחת סתימות",
  },
});

assert(
  withExplicitDiscount.variants.some((v) => v.caption.includes("10%")),
  "explicit user discount must survive",
);

console.log("pipeline.grounding.test.ts: OK");
