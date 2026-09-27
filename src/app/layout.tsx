import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutKontejner from './LayoutKontejner';

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
        {/* LayoutKontejner unutar sebe pametno upravlja i Sidebarom i mobilnim zaglavljem */}
        <LayoutKontejner>
          {children}
        </LayoutKontejner>
      </body>
    </html>
  );
}
