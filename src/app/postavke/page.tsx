'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import PostavkeForma from './PostavkeForma';

function PostavkeSadrzaj() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tvrtkaId = Number(searchParams.get('tvrtka_id') || '1');

  const [postavke, setPostavke] = useState({
    tvrtka_id: tvrtkaId,
    firma_naziv: '',
    firma_adresa: '',
    firma_oib: '',
    zakonska_napomena: 'Cijene su iskazane u eurima s uključenim porezom.'
  });

  useEffect(() => {
    async function ucitajPostavke() {
      try {
        const { data: tvrtkaData } = await supabase
          .from('tvrtke')
          .select('naziv, adresa, oib, napomena')
          .eq('id', tvrtkaId);

        if (tvrtkaData && tvrtkaData.length > 0) {
          setPostavke({
            tvrtka_id: tvrtkaId,
            firma_naziv: tvrtkaData[0].naziv || '',
            firma_adresa: tvrtkaData[0].adresa || '',
            firma_oib: tvrtkaData[0].oib || '',
            zakonska_napomena: tvrtkaData[0].napomena || 'Cijene su iskazane u eurima s uključenim porezom.'
          });
        }
      } catch (error) {
        console.error('Greška pri dohvaćanju postavki tvrtke:', error);
      } finally {
        setLoading(false);
      }
    }

    if (tvrtkaId) {
      ucitajPostavke();
    }
  }, [tvrtkaId]);

  if (loading) {
    return <div className="p-8 text-sm font-semibold text-gray-400 select-none animate-pulse">Učitavanje postavki...</div>;
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

export default function PostavkePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm font-semibold text-gray-400">Učitavanje stranice...</div>}>
      <PostavkeSadrzaj />
    </Suspense>
  );
}
