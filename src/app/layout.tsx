import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import LayoutKontejner from './LayoutKontejner';
import { supabase } from '@/utils/supabase';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PriceHub - Digitalni cjenik',
  description: 'Sustav za praćenje i kalkulaciju cijena',
};

// Funkcija koja na serveru dohvaća firmu za layout
async function dohvatiGlobalnuFirmaPostavku() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profil } = await supabase
      .from('korisnici_profili')
      .select('tvrtka_id')
      .eq('id', user.id)
      .single();

    const tvrtkaId = profil?.tvrtka_id ? Number(profil.tvrtka_id) : 1;

    const { data: tvrtka } = await supabase
      .from('tvrtke')
      .select('naziv, adresa, oib')
      .eq('id', tvrtkaId)
      .single();

    return tvrtka;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tvrtkaPodaci = await dohvatiGlobalnuFirmaPostavku();
  
  const firma = {
    naziv: tvrtkaPodaci?.naziv || 'Naziv tvrtke d.o.o.',
    adresa: tvrtkaPodaci?.adresa || 'Ulica i broj, Grad',
    oib: tvrtkaPodaci?.oib || '00000000000'
  };

  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* LayoutKontejner je ponovno tu i drži cijeli dizajn aplikacije na okupu! */}
          <LayoutKontejner firma={firma}>
            {children}
          </LayoutKontejner>
        </Providers>
      </body>
    </html>
  );
}
