import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { StoreProvider } from '@/context/StoreContext';
import SiteChrome from '@/components/layout/SiteChrome';
import ToastHost from '@/components/ui/ToastHost';
import RevealObserver from '@/components/ui/RevealObserver';

export const metadata: Metadata = {
  title: 'Kailash Enterprises — Real Stock, Honestly Photographed',
  description: 'Real stock, honestly photographed — shop Kalamkari, Warli print, Bandhani border and woven cotton sarees.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥻</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <StoreProvider>
          <SiteChrome>{children}</SiteChrome>
          <ToastHost />
          <RevealObserver />
        </StoreProvider>
      </body>
    </html>
  );
}
