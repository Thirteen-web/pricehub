import { supabase } from '@/utils/supabase';
import GrupeUpravljanje from './GrupeUpravljanje'; // <--- KLJUČNO: Uvozimo grupe, a ne artikle!

// FUNKCIJA ZA DOHVAT GRUPA KOJA FILTRIRA PO TVRTKI
async function getGrupePodaci(tvrtkaId: number) {
  const { data: grupe } = await supabase
    .from('grupe')
    .select('*')
    .eq('tvrtka_id', tvrtkaId) // Multi-tenant izolacija grupa
    .order('naziv', { ascending: true });

  return (grupe as any[]) || [];
}

// SERVER KOMPONENTA ZA STRANICU GRUPA
export default async function GrupePage() {
  // 1. Provjera trenutno ulogiranog korisnika na poslužitelju
  const { data: { user } } = await supabase.auth.getUser();

  // Ako korisnik nije ulogiran, preusmjeravamo ga na login ekran
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }

  // 2. Dohvat profila korisnika kako bismo saznali ID njegove tvrtke
  const { data: profil } = await supabase
    .from('korisnici_profili')
    .select('tvrtka_id')
    .eq('id', user!.id)
    .single();

  // Ako profil nema tvrtku u bazi, koristimo ID 1 kao fallback
  const trenutnaTvrtkaId = profil?.tvrtka_id ? Number(profil.tvrtka_id) : 1;

  // 3. Dohvaćanje grupa izoliranih isključivo za ulogiranu tvrtku
  const grupe = await getGrupePodaci(trenutnaTvrtkaId);

  return (
    <main className="w-full pt-2">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* SADA ISPRAVNO POKREĆEMO UPRAVLJANJE GRUPAMA */}
        <GrupeUpravljanje pocetneGrupe={grupe} tvrtkaId={trenutnaTvrtkaId} />
      </div>
    </main>
  );
}
