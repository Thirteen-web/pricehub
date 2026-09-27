import { supabase } from '@/utils/supabase';
import PostavkeForma from '@/app/postavke/PostavkeForma';

async function getSvePostavke() {
  const { data: postavke, error } = await supabase
    .from('postavke')
    .select('kljuc, vrijednost');

  if (error) {
    console.error('Greška pri dohvaćanju postavki:', error);
  }

  const napomena = postavke?.find(p => p.kljuc === 'zakonska_napomena')?.vrijednost || '';
  const fNaziv = postavke?.find(p => p.kljuc === 'firma_naziv')?.vrijednost || '';
  const fAdresa = postavke?.find(p => p.kljuc === 'firma_adresa')?.vrijednost || '';
  const fOib = postavke?.find(p => p.kljuc === 'firma_oib')?.vrijednost || '';

  return {
    zakonska_napomena: napomena,
    firma_naziv: fNaziv,
    firma_adresa: fAdresa,
    firma_oib: fOib
  };
}

export default async function PostavkeStranica() {
  const svePostavke = await getSvePostavke();

  return (
    // UKLONJENA KLASA pl-64: Bočni odmak sada u potpunosti prepuštamo globalnom layoutu radi savršenog centriranja
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8 pt-2 transition-colors duration-200">
      <div className="w-full max-w-3xl space-y-6">
        <header className="mb-8 border-b border-gray-200/60 dark:border-gray-800 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Opcije sustava</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Upravljanje podacima tvrtke i zakonskim tekstovima za cjenike</p>
        </header>

        <PostavkeForma inicijalnePostavke={svePostavke} />
      </div>
    </main>
  );
}
