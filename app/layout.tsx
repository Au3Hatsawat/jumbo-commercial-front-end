import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import { GlobalToaster } from '@/components/ui/GlobalToaster';

export const metadata: Metadata = {
  title: 'Retail POS System',
  description: 'Point of Sale system built with Next.js and TanStack Query',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
        <GlobalToaster />
      </body>
    </html>
  );
}