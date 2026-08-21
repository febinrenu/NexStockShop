import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, directionFor } from "@/i18n/routing";
import { themeFontVariables } from "@/lib/themes/fonts";
import { getTenantSettings } from "@/lib/tenant";
import { AppProviders } from "@/components/providers/AppProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings();
  return {
    title: settings.name ?? "Storefront",
    description: settings.name ? `Shop ${settings.name}` : "Powered by TrippleShop",
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [messages, settings] = await Promise.all([getMessages(), getTenantSettings()]);
  const themeSlug = settings.branding?.theme || "futurex";
  const storeName = settings.name ?? "Storefront";
  const defaultCurrency = settings.default_currency ?? "USD";

  return (
    <html
      lang={locale}
      dir={directionFor(locale)}
      data-theme={themeSlug}
      className={`${themeFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-ink">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders defaultCurrency={defaultCurrency}>
            <Header storeName={storeName} />
            <main className="flex-1">{children}</main>
            <Footer storeName={storeName} />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
