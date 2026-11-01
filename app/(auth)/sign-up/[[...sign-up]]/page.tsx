import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/config";
import Link from "next/link";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-bold text-brand-primary">Sign up</h1>
        <p className="text-center text-sm text-brand-accent/70">
          Add Clerk keys to <code className="rounded bg-brand-surface px-1">.env.local</code>{" "}
          to enable registration. Demo mode is active.
        </p>
        <Link
          href="/onboarding"
          className="rounded-xl bg-brand-primary px-4 py-3 font-semibold text-white"
        >
          Continue onboarding (demo)
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-full items-center justify-center p-8">
      <SignUp />
    </main>
  );
}
