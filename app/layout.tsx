import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { DocumentLocale } from "@/components/domain/DocumentLocale";
import { Providers } from "@/components/domain/Providers";
import { defaultLocale, dirForLocale } from "@/lib/i18n/config";
import { isClerkConfigured } from "@/lib/auth/config";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "One Loop Social",
  description:
    "Capture to publish in 2–3 minutes — grounded posts for local businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = defaultLocale;
  const dir = dirForLocale(locale);
  const clerkEnabled = isClerkConfigured();

  return (
    <html lang={locale} dir={dir} className={`${heebo.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-brand-canvas text-brand-accent">
        <DocumentLocale initialLocale={locale} />
        <Providers clerkEnabled={clerkEnabled}>{children}</Providers>
      </body>
    </html>
  );
}
