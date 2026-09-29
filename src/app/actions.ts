'use server'; // <--- Popravljen navodnik za serverske akcije

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';

// 1. AKCIJA ZA BRISANJE ARTIKLA
export async function obrisiArtikl(id: number) {
  const { error } = await supabase.from('artikli').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/');
  return { success: true };
}

// 2. AKCIJA ZA DODAVANJE I UREĐIVANJE ARTIKLA - SADA S TENANT ID PODRŠKOM
export async function spremiArtikl(data: {
  id?: number;
  naziv: string;
  grupa_id: number | null;
  normativ: string | null;
  sidrena_cijena: number | null;
  cijena: number;
  datum_unosa: string;
  tvrtka_id: number; // <--- Ugrađeno svojstvo koje je TypeScript tražio u modalu
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
        tvrtka_id: data.tvrtka_id, // <--- Zadržavamo oznaku tvrtke pri ažuriranju
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
        tvrtka_id: data.tvrtka_id, // <--- Zapisujemo vlasnika novog artikla u bazu podataka
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

// 4. AKCIJA ZA DODAVANJE I UREĐIVANJE GRUPE - SADA STOPPOSTOTNO TOČNA
export async function spremiGrupu(data: { id?: number; naziv: string; tvrtka_id: number }) {
  if (!data.naziv) return { success: false, error: 'Naziv grupe je obavezan!' };
  
  if (data.id) {
    const { error } = await supabase
      .from('grupe') // <--- Točan naziv tablice
      .update({ naziv: data.naziv, tvrtka_id: data.tvrtka_id })
      .eq('id', data.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('grupe') // <--- Ispravljen tipfeler ovdje!
      .insert([{ naziv: data.naziv, tvrtka_id: data.tvrtka_id }]);
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
  
  return { success: true, token: data.session?.access_token, maxAge: data.session?.expires_in };
}
// 7. AKCIJA ZA SPREMANJE PODATAKA O TVRTKI (SADA SVAKA TVRTKA UPSEŠNO UPDATEA SVOJ REDAK)
export async function spremiSvePostavke(data: {
  tvrtka_id: number;
  firma_naziv: string;
  firma_adresa: string;
  firma_oib: string;
  zakonska_napomena: string; // Zakonsku napomenu i dalje držimo u 'postavke' ili tvrtke tablici
}) {
  try {
    // 1. Ažuriramo memorandum izravno unutar nove tablice 'tvrtke'
    const { error: tvrtkaError } = await supabase
      .from('tvrtke')
      .update({
        naziv: data.firma_naziv,
        adresa: data.firma_adresa,
        oib: data.firma_oib
      })
      .eq('id', data.tvrtka_id);

    if (tvrtkaError) throw tvrtkaError;

    // 2. Ažuriramo zakonsku napomenu u tablici 'postavke' za tu tvrtku
    const { error: postavkeError } = await supabase
      .from('postavke')
      .update({ vrijednost: data.zakonska_napomena })
      .eq('kljuc', 'zakonska_napomena')
      .eq('tvrtka_id', data.tvrtka_id);

    if (postavkeError) throw postavkeError;

    revalidatePath('/postavke');
    revalidatePath('/'); 
    return { success: true };
  } catch (error: any) {
    console.error('Greška pri spremanju postavki tvrtke:', error);
    return { success: false, error: error.message };
  }
}
// 8. SUPERADMIN AKCIJA: KREIRANJE NOVE TVRTKE I KORISNIKA IZAPLIKACIJE
export async function kreirajNovuTvrtkuIKorisnika(data: {
  naziv_tvrtke: string;
  adresa_tvrtke: string;
  oib_tvrtke: string;
  email_korisnika: string;
  lozinka_korisnika: string;
  ime_prezime: string;
}) {
  try {
    // 1. Upisujemo novu tvrtku u tablicu 'tvrtke'
    const { data: novaTvrtka, error: tvrtkaError } = await supabase
      .from('tvrtke')
      .insert([
        {
          naziv: data.naziv_tvrtke,
          adresa: data.adresa_tvrtke,
          oib: data.oib_tvrtke,
        },
      ])
      .select()
      .single();

    if (tvrtkaError) throw tvrtkaError;
    const novaTvrtkaId = novaTvrtka.id;

    // 2. Registriramo novog korisnika u Supabase Auth sustavu pomoću administrativnog ključa
    // (Napomena: Koristimo signUp, a budući da si ti ulogiran, ovo stvara čisti Auth zapis)
    const { data: authKorisnik, error: authError } = await supabase.auth.signUp({
      email: data.email_korisnika.trim(),
      password: data.lozinka_korisnika,
      options: {
        data: {
          ime_prezime: data.ime_prezime,
        }
      }
    });

    if (authError) throw authError;
    if (!authKorisnik.user) throw new Error('Korisnik nije uspješno kreiran u Auth sustavu.');

    // 3. Povezujemo novostvorenog korisnika s njegovom tvrtkom u 'korisnici_profili'
    const { error: profilError } = await supabase
      .from('korisnici_profili')
      .insert([
        {
          id: authKorisnik.user.id,
          tvrtka_id: novaTvrtkaId,
          ime_prezime: data.ime_prezime,
          uloga: 'korisnik', // Novi klijent je običan korisnik svog cjenika
        },
      ]);

    if (profilError) throw profilError;

    // 4. Inicijalno ubacujemo praznu zakonsku napomenu za novu tvrtku u 'postavke'
    await supabase.from('postavke').insert([
      { kljuc: 'zakonska_napomena', vrijednost: 'U cijene je uračunat PDV.', tvrtka_id: novaTvrtkaId }
    ]);

    return { success: true };
  } catch (error: any) {
    console.error('Greška u superadmin kreiranju tvrtke:', error);
    return { success: false, error: error.message };
  }
}


