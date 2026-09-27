import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutKontejner from './LayoutKontejner';
import { Providers } from './providers'; // <--- Vraćamo uvoz tvog provajdera za teme

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PriceHub - Digitalni cjenik',
  description: 'Sustav za praćenje i kalkulaciju cijena',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Omotavamo aplikaciju u Providers kako bi gumb za tamni mod odmah proradio */}
        <Providers>
          <LayoutKontejner>
            {children}
          </LayoutKontejner>
        </Providers>
      </body>
    </html>
  );
}
