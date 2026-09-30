'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { dohvatiPostavkeTvrtke } from '../actions';
import PostavkeForma from './PostavkeForma';

function PostavkeSadrzaj() {
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
        // Nativni dohvat parametara iz URL trake preglednika - stopostotna klijentska točnost
        const params = new URLSearchParams(window.location.search);
        const tId = Number(params.get('tvrtka_id') || '1');

        const res = await dohvatiPostavkeTvrtke(tId);
        if (res.success && res.podataci) {
          setPostavke(res.podataci);
        }
      } catch (error) {
        console.error('Greška pri dohvaćanju postavki tvrtke:', error);
      } finally {
        setLoading(false);
      }
    }

    ucitajPostavke();
  }, []); // Prazan niz osigurava da se učitavanje odvrti točno JEDNOM bez beskonačnih petlji!

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
    <Suspense fallback={<div className="p-8 text-sm font-semibold text-gray-400">Učitavanje...</div>}>
      <PostavkeSadrzaj />
    </Suspense>
  );
}
