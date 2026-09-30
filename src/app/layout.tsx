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

// Neprobojna serverska funkcija koja dohvaća sve podatke i broji artikle
async function dohvatiGlobalneSaaSPodatke() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profilData } = await supabase
      .from('korisnici_profili')
      .select('tvrtka_id, uloga')
      .eq('id', user.id);

    const profil = profilData && profilData.length > 0 ? profilData[0]  : null;
    const tvrtkaId = profil?.tvrtka_id ? Number(profil.tvrtka_id) : 1;
    const uloga = profil?.uloga || 'korisnik';

    // 1. Dohvaćamo podatke o tvrtki
    const { data: tvrtka } = await supabase
      .from('tvrtke')
      .select('naziv, adresa, oib')
      .eq('id', tvrtkaId)
      .single();

    // 2. SPASONOSNI KORAK: Brzi i lagani upit koji broji ima li tvrtka artikala u bazi
    const { count } = await supabase
      .from('artikli')
      .select('*', { count: 'exact', head: true })
      .eq('tvrtka_id', tvrtkaId);

    const imaPodataka = count !== null && count > 0;

    return { tvrtka, uloga, tvrtkaId, imaPodataka };
  } catch (error) {
    console.warn('Problem na serveru:', error);
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
  const imaPodatakaKorisnika = saasPodaci?.imaPodataka || false; // <--- SADA JE TRENUTAČNO I TOČNO IZRAČUNATO!

  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* Šaljemo sve izračunate podatke s vrha izravno u LayoutKontejner */}
          <LayoutKontejner firma={firma} uloga={ulogaKorisnika} imaPodataka={imaPodatakaKorisnika}>
            {children}
          </LayoutKontejner>
        </Providers>
      </body>
    </html>
  );
}
