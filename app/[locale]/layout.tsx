import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import { GlobalToaster } from '@/components/ui/GlobalToaster';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Retail POS System',
  description: 'Point of Sale system built with Next.js and TanStack Query',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const messages = await getMessages();
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            {children}
          </AppProviders>
          <GlobalToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}