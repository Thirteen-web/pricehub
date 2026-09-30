import { supabase } from '@/utils/supabase';
import PostavkeForma from './PostavkeForma';

export default async function PostavkePage() {
  // 1. Sigurnosna provjera ulogiranog korisnika na poslužitelju
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }
  let tvrtkaId = 1;
  let firmaNaziv = '';
  let firmaAdresa = '';
  let firmaOib = '';
  let zakonskaNapomena = 'Cijene su iskazane u eurima s uključenim porezom.';

  try {
    // 2. Dohvat tvrtka_id iz profila korisnika
    const { data: profilData } = await supabase
      .from('korisnici_profili')
      .select('tvrtka_id')
      .eq('id', user!.id);

    if (profilData && profilData.length > 0) {
      tvrtkaId = Number(profilData[0].tvrtka_id);
    }    // 3. Dohvat memoranduma i napomene izravno iz tablice 'tvrtke' (OČIŠĆENE STARE POSTAVKE)
    const { data: tvrtkaData } = await supabase
      .from('tvrtke')
      .select('naziv, adresa, oib, napomena') // <--- POVLAČIMO I STUPAC NAPOMENA!
      .eq('id', tvrtkaId);

    if (tvrtkaData && tvrtkaData.length > 0) {
      firmaNaziv = tvrtkaData[0].naziv || '';
      firmaAdresa = tvrtkaData[0].adresa || '';
      firmaOib = tvrtkaData[0].oib || '';
      // Ako u tablici tvrtke postoji napomena, koristimo je, inače ostaje zadani fallback
      if (tvrtkaData[0].napomena) {
        zakonskaNapomena = tvrtkaData[0].napomena;
      }
    }
  } catch (error) {
    console.warn('Postavke sustava učitane uz obrambeni mehanizam:', error);
  }

  // Pakiramo ulaštene i sigurne podatke za formu
  const pocetnePostavke = {
    tvrtka_id: tvrtkaId,
    firma_naziv: firmaNaziv,
    firma_adresa: firmaAdresa,
    firma_oib: firmaOib,
    zakonska_napomena: zakonskaNapomena // Prosljeđujemo novu vrijednost prema PostavkeForma
  };

  return (
    <main className="w-full pt-2">
      <div className="max-w-3xl ml-0 space-y-6">
        <div className="select-none">
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Postavke sustava</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Upravljanje memorandumom tvrtke i zakonskim napomenama na PDF-u</p>
        </div>  
        <PostavkeForma pocetnePostavke={pocetnePostavke} />
      </div>
    </main>
  );
}
