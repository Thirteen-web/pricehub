import { supabase } from '@/utils/supabase';
import CjenikPrikaz from './CjenikPrikaz'; // <--- OVO JE TOČNA RELATIVNA PUTANJA KOJA UKLANJA SVE GREŠKE!

async function getCjenikPodaci() {
  // 1. Dohvaćanje artikala s njihovim grupama
  const { data: artikli } = await supabase
    .from('artikli')
    .select('*, grupe(naziv)')
    .order('naziv', { ascending: true });

  // 2. Dohvaćanje svih grupa proizvoda
  const { data: grupe } = await supabase
    .from('grupe')
    .select('*')
    .order('naziv', { ascending: true });

  // 3. Dohvaćanje svih postavki iz baze podataka
  const { data: postavke } = await supabase
    .from('postavke')
    .select('kljuc, vrijednost');

  const fNaziv = postavke?.find(p => p.kljuc === 'firma_naziv')?.vrijednost || 'Naziv tvrtke d.o.o.';
  const fAdresa = postavke?.find(p => p.kljuc === 'firma_adresa')?.vrijednost || 'Ulica i kućni broj, Grad';
  const fOib = postavke?.find(p => p.kljuc === 'firma_oib')?.vrijednost || 'OIB: 00000000000';

  return {
    artikli: (artikli as any[]) || [],
    grupe: (grupe as any[]) || [],
    firma: { naziv: fNaziv, adresa: fAdresa, oib: fOib }
  };
}

export default async function Home() {
  const { artikli, grupe, firma } = await getCjenikPodaci();

  return (
    // Puna Dark Mode sinkronizacija pozadine na glavnom ekranu
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-2 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        <CjenikPrikaz pocetniArtikli={artikli} grupe={grupe} firma={firma} />
      </div>
    </main>
  );
}
