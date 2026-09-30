import { supabase } from '@/utils/supabase';
import CjenikPrikaz from './CjenikPrikaz'; 
import LayoutKontejner from './LayoutKontejner';

export const dynamic = 'force-dynamic';

async function getCjenikPodaci(tvrtkaId: number) {
  const { data: artikli } = await supabase
    .from('artikli')
    .select('*, grupe(naziv)')
    .eq('tvrtka_id', tvrtkaId) 
    .order('grupa_id', { ascending: true })
    .order('naziv', { ascending: true });

  const { data: grupe } = await supabase
    .from('grupe')
    .select('*')
    .eq('tvrtka_id', tvrtkaId) 
    .order('naziv', { ascending: true });

  const { data: tvrtkaPodaci } = await supabase
    .from('tvrtke')
    .select('naziv, adresa, oib')
    .eq('id', tvrtkaId)
    .single();

  return {
    artikli: (artikli as any[]) || [],
    grupe: (grupe as any[]) || [],
    firma: { 
      naziv: tvrtkaPodaci?.naziv || 'Naziv tvrtke d.o.o.', 
      adresa: tvrtkaPodaci?.adresa || 'Ulica i kućni broj, Grad', 
      oib: tvrtkaPodaci?.oib || '00000000000' 
    }
  };
}

export default async function Home() {
  let trenutnaTvrtkaId = 1; 

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profil } = await supabase
        .from('korisnici_profili')
        .select('tvrtka_id')
        .eq('id', user.id)
        .single();

      if (profil?.tvrtka_id) {
        trenutnaTvrtkaId = Number(profil.tvrtka_id);
      }
    }
  } catch (authError) {
    console.warn('Problem sa sesijom, koristim fallback tvrtku 1:', authError);
  }

   const { artikli, grupe, firma } = await getCjenikPodaci(trenutnaTvrtkaId);

  // Čisti i stabilni povrat - LayoutKontejner je maknut jer se već nalazi u krovnom layout.tsx!
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <CjenikPrikaz pocetniArtikli={artikli} grupe={grupe} firma={firma} tvrtkaId={trenutnaTvrtkaId} />
    </div>
  );
}