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

// 10. PAMETNI MULTI-TENANT UPSERT UVOZ S ZAŠTITOM OD DUPLIH REDAKA IZ CSV-A
export async function uvoziArtikleIzTablice(data: {
  tvrtka_id: number;
  artikli: Array<{ naziv: string; cijena: number; grupa_naziv: string; normativ?: string }>;
}) {
  try {
    const tvrtkaId = Number(data.tvrtka_id);
    const fiksniDatum = "2026-10-01T00:00:00+00:00";

    // 1. KORAK: Filtriranje duplih artikala unutar SAME uvezene datoteke (Uzima se zadnji unosi)
    const jedinstveniArtikliIzDatoteke: Record<string, typeof data.artikli[0]> = {};
    data.artikli.forEach(art => {
      const kljuc = art.naziv.trim().toLowerCase();
      if (kljuc) {
        jedinstveniArtikliIzDatoteke[kljuc] = art;
      }
    });

    // Pretvaramo očišćenu mapu natrag u niz za daljnju standardnu obradu
    const cistiArtikliIzDatoteke = Object.values(jedinstveniArtikliIzDatoteke);

    // A) Dohvat i mapiranje postojećih grupa
    const { data: postojeceGrupe } = await supabase
      .from('grupe')
      .select('id, naziv')
      .eq('tvrtka_id', tvrtkaId);

    const mapaGrupa: Record<string, number> = {};
    if (postojeceGrupe) {
      postojeceGrupe.forEach(g => { mapaGrupa[g.naziv.toLowerCase().trim()] = g.id; });
    }
    let ostaloGrupaId = mapaGrupa['ostalo'] || null;

    // B) Dohvat i mapiranje postojećih artikala zbog Upsert provjere
    const { data: postojeciArtikli } = await supabase
      .from('artikli')
      .select('id, naziv, cijena, normativ')
      .eq('tvrtka_id', tvrtkaId);

    const mapaArtikala: Record<string, { id: number; cijena: number; normativ: string }> = {};
    if (postojeciArtikli) {
      postojeciArtikli.forEach(a => {
        mapaArtikala[a.naziv.toLowerCase().trim()] = { id: a.id, cijena: Number(a.cijena), normativ: a.normativ || '' };
      });
    }

    const artikliZaUpis: any[] = [];
    const artikliZaAzuriranje: any[] = [];

    // C) Inteligentna petlja kroz OČIŠĆENE i jedinstvene artikle
    for (const art of cistiArtikliIzDatoteke) {
      const cistoImeArtikla = art.naziv.trim();
      const kljucArtikla = cistoImeArtikla.toLowerCase();
      if (!cistoImeArtikla) continue;

      let cistoImeGrupe = art.grupa_naziv ? art.grupa_naziv.trim() : 'Ostalo';
      let kljucGrupe = cistoImeGrupe.toLowerCase();
      let ispravanGrupaId: number;

      if (mapaGrupa[kljucGrupe]) {
        ispravanGrupaId = mapaGrupa[kljucGrupe];
      } else {
        if (kljucGrupe === 'ostalo' && ostaloGrupaId) {
          ispravanGrupaId = ostaloGrupaId;
        } else {
          const { data: novaGrupa, error: gErr } = await supabase
            .from('grupe')
            .insert([{ naziv: cistoImeGrupe, tvrtka_id: tvrtkaId }])
            .select().single();

          if (gErr) throw gErr;
          ispravanGrupaId = novaGrupa.id;
          mapaGrupa[kljucGrupe] = novaGrupa.id;
          if (kljucGrupe === 'ostalo') ostaloGrupaId = novaGrupa.id;
        }
      }

      const trenutniNormativ = art.normativ ? art.normativ.trim() : 'kom';

      // SADA VIŠE NEMA ŠANSE ZA ON CONFLICT DUPLIRANJE!
      if (mapaArtikala[kljucArtikla]) {
        if (mapaArtikala[kljucArtikla].cijena !== art.cijena || mapaArtikala[kljucArtikla].normativ !== trenutniNormativ) {
          artikliZaAzuriranje.push({
            id: mapaArtikala[kljucArtikla].id,
            naziv: cistoImeArtikla,
            cijena: art.cijena,
            normativ: trenutniNormativ,
            grupa_id: ispravanGrupaId,
            tvrtka_id: tvrtkaId
          });
        }
      } else {
        artikliZaUpis.push({
          naziv: cistoImeArtikla,
          cijena: art.cijena,
          sidrena_cijena: art.cijena,
          normativ: trenutniNormativ,
          datum_unosa: fiksniDatum,
          grupa_id: ispravanGrupaId,
          tvrtka_id: tvrtkaId
        });
      }
    }

    // D) Masovni upis i ažuriranje u bazi podataka
    if (artikliZaUpis.length > 0) {
      const { error: insErr } = await supabase.from('artikli').insert(artikliZaUpis);
      if (insErr) throw insErr;
    }

    if (artikliZaAzuriranje.length > 0) {
      const { error: updErr } = await supabase.from('artikli').upsert(artikliZaAzuriranje);
      if (updErr) throw updErr;
    }

    return { success: true, unesenih: artikliZaUpis.length, azuriranih: artikliZaAzuriranje.length };
  } catch (error: any) {
    console.error('Greška u serverskom uvozu cjenika:', error);
    return { success: false, error: error.message };
  }
}


// 11. SIGURNO MULTI-TENANT SPREMANJE SVIH POSTAVKI I NAPOMENE U TABLICU TVRTKE
export async function spremiSvePostavke(data: {
  tvrtka_id: number;
  firma_naziv: string;
  firma_adresa: string;
  firma_oib: string;
  zakonska_napomena: string;
}) {
  try {
    const tvrtkaId = Number(data.tvrtka_id);

    // Sve podatke (uključujući i novu zakonsku napomenu) spremamo izravno u redak tvrtke!
    const { error } = await supabase
      .from('tvrtke')
      .update({
        naziv: data.firma_naziv.trim(),
        adresa: data.firma_adresa.trim(),
        oib: data.firma_oib.trim(),
        napomena: data.zakonska_napomena.trim() // <--- SPREMANJE U NOVI STUPAC!
      })
      .eq('id', tvrtkaId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Greška pri spremanju svih postavki tvrtke:', error);
    return { success: false, error: error.message };
  }
}
