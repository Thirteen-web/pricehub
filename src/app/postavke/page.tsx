'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import PostavkeForma from './PostavkeForma';

export default function PostavkePage() {
  const [loading, setLoading] = useState(true);
  const [postavke, setPostavke] = useState({
    tvrtka_id: 1,
    firma_naziv: '',
    firma_adresa: '',
    firma_oib: '',
    zakonska_napomena: 'Cijene su iskazane u eurima s uključenim porezom.'
  });

  useEffect(() => {
    async function ucitajPostavke() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          alert('Auth greška: ' + authError.message);
          setLoading(false);
          return;
        }

        const user = authData?.user;
        if (user) {
          // 1. Dohvat profila
          const { data: profilData, error: profError } = await supabase
            .from('korisnici_profili')
            .select('tvrtka_id')
            .eq('id', user.id);

          if (profError) {
            alert('Greška profila: ' + profError.message);
          }

          let tId = 1;
          if (profilData && profilData.length > 0) {
            tId = Number(profilData[0].tvrtka_id);
          }

          // 2. Dohvat tvrtke
          const { data: tvrtkaData, error: tvrtkaError } = await supabase
            .from('tvrtke')
            .select('naziv, adresa, oib, napomena')
            .eq('id', tId);

          if (tvrtkaError) {
            alert('Greška tvrtke: ' + tvrtkaError.message);
          }

          if (tvrtkaData && tvrtkaData.length > 0) {
            setPostavke({
              tvrtka_id: tId,
              firma_naziv: tvrtkaData[0].naziv || '',
              firma_adresa: tvrtkaData[0].adresa || '',
              firma_oib: tvrtkaData[0].oib || '',
              zakonska_napomena: tvrtkaData[0].napomena || 'Cijene su iskazane u eurima s uključenim porezom.'
            });
          }
        } else {
          alert('Korisnik nije ulogiran prema klijentskom Supabase-u!');
        }
      } catch (error: any) {
        alert('Neočekivani sistemski krah: ' + error.message);
      } finally {
        setLoading(false);
      }
    }

    ucitajPostavke();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-sm font-semibold text-gray-400 select-none animate-pulse">
        Učitavanje postavki sustava...
      </div>
    );
  }

  return (
    <main className="w-full pt-2">
      <div className="max-w-3xl ml-0 space-y-6">
        <div className="select-none">
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Postavke sustava</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Upravljanje memorandumom tvrtke i zakonskim napomenama na PDF-u</p>
        </div>  
        <PostavkeForma pocetnePostavke={postavke} />
      </div>
    </main>
  );
}
