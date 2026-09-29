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

async function dohvatiGlobalneSaaSPodatke() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profilData } = await supabase
      .from('korisnici_profili')
      .select('tvrtka_id, uloga')
      .eq('id', user.id);

    const profil = profilData && profilData.length > 0 ? profilData[0] : null;
    const tvrtkaId = profil?.tvrtka_id ? Number(profil.tvrtka_id) : 1;
    const uloga = profil?.uloga || 'korisnik';

    const { data: tvrtka } = await supabase
      .from('tvrtke')
      .select('naziv, adresa, oib')
      .eq('id', tvrtkaId)
      .single();

    return { tvrtka, uloga };
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const saasPodaci = await dohvatiGlobalneSaaSPodatke();
  
  const firma = {
    naziv: saasPodaci?.tvrtka?.naziv || 'Naziv tvrtke d.o.o.',
    adresa: saasPodaci?.tvrtka?.adresa || 'Ulica i broj, Grad',
    oib: saasPodaci?.tvrtka?.oib || '00000000000'
  };

  const ulogaKorisnika = saasPodaci?.uloga || 'korisnik';

  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <LayoutKontejner firma={firma} uloga={ulogaKorisnika}>
            {children}
          </LayoutKontejner>
        </Providers>
      </body>
    </html>
  );
}
