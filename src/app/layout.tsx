import type { Metadata } from 'next'; // <--- Popravljen uvoz iz 'next' paketa
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { supabase } from '@/utils/supabase';
import LayoutKontejner from '@/app/LayoutKontejner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PriceHub - Kontrola Cjenika',
  description: 'Sustav za upravljanje cjenicima i artiklima',
};

async function getFirmaPostavke() {
  const { data: postings } = await supabase
    .from('postavke')
    .select('kljuc, vrijednost');

  const fNaziv = postings?.find(p => p.kljuc === 'firma_naziv')?.vrijednost || 'Naziv tvrtke d.o.o.';
  const fAdresa = postings?.find(p => p.kljuc === 'firma_adresa')?.vrijednost || 'Ulica i kućni broj, Grad';
  const fOib = postings?.find(p => p.kljuc === 'firma_oib')?.vrijednost || 'OIB: 00000000000';

  return { naziv: fNaziv, adresa: fAdresa, oib: fOib };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const firma = await getFirmaPostavke();

  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200`}>
        <Providers>
          <LayoutKontejner firma={firma}>
            {children}
          </LayoutKontejner>
        </Providers>
      </body>
    </html>
  );
}
