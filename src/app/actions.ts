'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';

// 1. AKCIJA ZA BRISANJE ARTIKLA
export async function obrisiArtikl(id: number) {
  const { error } = await supabase.from('artikli').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  return { success: true };
}

// 2. AKCIJA ZA DODAVANJE I UREĐIVANJE ARTIKLA
export async function spremiArtikl(data: {
  id?: number;
  naziv: string;
  grupa_id: number | null;
  normativ: string | null;
  sidrena_cijena: number | null;
  cijena: number;
  datum_unosa: string;
}) {
  if (data.id) {
    const { error } = await supabase
      .from('artikli')
      .update({
        naziv: data.naziv,
        grupa_id: data.grupa_id,
        normativ: data.normativ,
        sidrena_cijena: data.sidrena_cijena,
        cijena: data.cijena,
        datum_unosa: data.datum_unosa,
      })
      .eq('id', data.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('artikli').insert([
      {
        naziv: data.naziv,
        grupa_id: data.grupa_id,
        normativ: data.normativ,
        sidrena_cijena: data.sidrena_cijena,
        cijena: data.cijena,
        datum_unosa: data.datum_unosa,
      },
    ]);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath('/');
  return { success: true };
}

// 3. AKCIJA ZA BRISANJE GRUPE
export async function obrisiGrupu(id: number) {
  const { error } = await supabase.from('grupe').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/grupe');
  revalidatePath('/');
  return { success: true };
}

// 4. AKCIJA ZA DODAVANJE I UREĐIVANJE GRUPE
export async function spremiGrupu(data: { id?: number; naziv: string }) {
  if (!data.naziv) return { success: false, error: 'Naziv grupe je obavezan!' };
  if (data.id) {
    const { error } = await supabase.from('grupe').update({ naziv: data.naziv }).eq('id', data.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('grupe').insert([{ naziv: data.naziv }]);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath('/grupe');
  revalidatePath('/');
  return { success: true };
}

// 5. PRIJAVA - SAMO PROVJERA PODATAKA (BEZ KOLAČIĆA NA SERVERU)
export async function prijavaKorisnika(email: string, lozinka: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: lozinka,
  });

  if (error) return { success: false, error: error.message };
  
  // Vraćamo token klijentu koji će ga sam spremiti u kolačiće
  return { success: true, token: data.session?.access_token, maxAge: data.session?.expires_in };
}

// 7. AKCIJA ZA SPREMANJE SVIH POSTAVKI SUSTAVA I PODATAKA O TVRTKI
export async function spremiSvePostavke(data: {
  zakonska_napomena: string;
  firma_naziv: string;
  firma_adresa: string;
  firma_oib: string;
}) {
  // Izvršavamo ažuriranja paralelno u bazi podataka radi maksimalne brzine
  const upiti = [
    supabase.from('postavke').update({ vrijednost: data.zakonska_napomena }).eq('kljuc', 'zakonska_napomena'),
    supabase.from('postavke').update({ vrijednost: data.firma_naziv }).eq('kljuc', 'firma_naziv'),
    supabase.from('postavke').update({ vrijednost: data.firma_adresa }).eq('kljuc', 'firma_adresa'),
    supabase.from('postavke').update({ vrijednost: data.firma_oib }).eq('kljuc', 'firma_oib'),
  ];

  const rezultati = await Promise.all(upiti);
  
  // Provjeravamo je li ijedan od upita vratio grešku
  const greska = rezultati.find(r => r.error)?.error;
  if (greska) {
    console.error('Greška pri spremanju postavki:', greska);
    return { success: false, error: greska.message };
  }

  revalidatePath('/postavke');
  revalidatePath('/'); // Osvježavamo i početnu stranicu kako bi odmah vidjela novu firmu
  return { success: true };
}