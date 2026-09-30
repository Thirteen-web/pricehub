'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { dohvatiPostavkeTvrtke } from '../actions'; // Uvozimo našu novu serversku akciju
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
      if (!tvrtkaId) return;
      
      // Pozivamo sigurnu serversku akciju koja trenutno zaobilazi RLS kočnice
      const res = await dohvatiPostavkeTvrtke(tvrtkaId);
      if (res.success && res.podataci) {
        setPostavke(res.podataci);
      }
      setLoading(false);
    }

    ucitajPostavke();
  }, [tvrtkaId]);

  if (loading) {
    return (
      <div className="p-8 text-sm font-semibold text-gray-400 select-none animate-pulse">
        Učitavanje postavki...
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

export default function PostavkePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm font-semibold text-gray-400">Učitavanje stranice...</div>}>
      <PostavkeSadrzaj />
    </Suspense>
  );
}
