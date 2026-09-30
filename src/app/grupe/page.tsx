'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { dohvatiGrupeZaTvrtku } from '../actions';
import GrupeUpravljanje from './GrupeUpravljanje';

function GrupeSadrzaj() {
  const [loading, setLoading] = useState(true);
  const [grupe, setGrupe] = useState<any[]>([]);
  const [tvrtkaId, setTvrtkaId] = useState<number>(1);

  useEffect(() => {
    async function ucitajGrupe() {
      try {
        // Nativni i nepogrešivi dohvat parametara iz preglednika - eliminira race condition!
        const params = new URLSearchParams(window.location.search);
        const tId = Number(params.get('tvrtka_id') || '1');
        setTvrtkaId(tId);

        const res = await dohvatiGrupeZaTvrtku(tId);
        if (res.success && res.podataci) {
          setGrupe(res.podataci);
        }
      } catch (error) {
        console.error('Greška pri učitavanju grupa:', error);
      } finally {
        setLoading(false);
      }
    }

    ucitajGrupe();
  }, []); // Prazan niz [] osigurava da se funkcija odvrti točno JEDNOM pri učitavanju stranice!

  if (loading) {
    return <div className="p-8 text-sm font-semibold text-gray-400 select-none animate-pulse">Učitavanje grupa...</div>;
  }

  return (
    <main className="w-full pt-2">
      <div className="max-w-7xl mx-auto space-y-6">
        <GrupeUpravljanje pocetneGrupe={grupe} tvrtkaId={tvrtkaId} />
      </div>
    </main>
  );
}

export default function GrupePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm font-semibold text-gray-400">Učitavanje stranice...</div>}>
      <GrupeSadrzaj />
    </Suspense>
  );
}
