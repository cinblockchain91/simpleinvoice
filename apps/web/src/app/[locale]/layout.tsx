import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider, QueryProvider } from "@/shared/ui";
import { Toaster } from "@/shadcn/ui/sonner";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { Header } from "@/widgets/app-shell";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
