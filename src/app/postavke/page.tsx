import { supabase } from '@/utils/supabase';
import PostavkeForma from './PostavkeForma';

export default async function PostavkePage() {
  // 1. Sigurnosna provjera ulogiranog korisnika na poslužitelju
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }

  // Definiramo zadane (fallback) vrijednosti u slučaju da baza vrati prazan odgovor
  let tvrtkaId = 1;
  let firmaNaziv = '';
  let firmaAdresa = '';
  let firmaOib = '';
  let zakonskaNapomena = '';

  try {
    // 2. Dohvat tvrtka_id iz profila korisnika bez rušenja (.single zamijenjen s običnim selectom)
    const { data: profilData } = await supabase
      .from('korisnici_profili')
      .select('tvrtka_id')
      .eq('id', user!.id);

    if (profilData && profilData.length > 0) {
      tvrtkaId = Number(profilData[0].tvrtka_id);
    }

    // 3. Dohvat memoranduma iz tablice 'tvrtke' na siguran način
    const { data: tvrtkaData } = await supabase
      .from('tvrtke')
      .select('*')
      .eq('id', tvrtkaId);

    if (tvrtkaData && tvrtkaData.length > 0) {
      firmaNaziv = tvrtkaData[0].naziv || '';
      firmaAdresa = tvrtkaData[0].adresa || '';
      firmaOib = tvrtkaData[0].oib || '';
    }

    // 4. Dohvat zakonske napomene iz tablice 'postavke' na siguran način
    const { data: postavkeData } = await supabase
      .from('postavke')
      .select('vrijednost')
      .eq('kljuc', 'zakonska_napomena')
      .eq('tvrtka_id', tvrtkaId);

    if (postavkeData && postavkeData.length > 0) {
      zakonskaNapomena = postavkeData[0].vrijednost || '';
    } else {
      // Ako napomena za ovu tvrtku još ne postoji u bazi, pokušavamo izvući globalni fallback
      const { data: globalnaNapomena } = await supabase
        .from('postavke')
        .select('vrijednost')
        .eq('kljuc', 'zakonska_napomena')
        .is('tvrtka_id', null);
        
      if (globalnaNapomena && globalnaNapomena.length > 0) {
        zakonskaNapomena = globalnaNapomena[0].vrijednost || '';
      }
    }
  } catch (error) {
    console.warn('Postavke sustava su učitane uz obrambeni fallback mehanizam:', error);
  }

  // Pakiramo ulaštene i sigurne podatke za formu
  const pocetnePostavke = {
    tvrtka_id: tvrtkaId,
    firma_naziv: firmaNaziv,
    firma_adresa: firmaAdresa,
    firma_oib: firmaOib,
    zakonska_napomena: zakonskaNapomena
  };

  return (
    <main className="w-full pt-2">
      <div className="max-w-3xl ml-0 space-y-6">
        <div className="select-none">
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Postavke sustava</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Upravljanje memorandumom tvrtke i zakonskim napomenama na PDF-u</p>
        </div>
        
        {/* Isctavamo klijentsku formu bez uduplavanja i bez ruterskih kočnica */}
        <PostavkeForma pocetnePostavke={pocetnePostavke} />
      </div>
    </main>
  );
}
