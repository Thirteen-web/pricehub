'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import GrupeUpravljanje from './GrupeUpravljanje';

function GrupeSadrzaj() {
  const [loading, setLoading] = useState(true);
  const [grupe, setGrupe] = useState<any[]>([]);
  
  const searchParams = useSearchParams();
  const tvrtkaId = Number(searchParams.get('tvrtka_id') || '1');

  useEffect(() => {
    async function ucitajGrupe() {
      try {
        const { data: grupeData } = await supabase
          .from('grupe')
          .select('*')
          .eq('tvrtka_id', tvrtkaId)
          .order('naziv', { ascending: true });

        setGrupe(grupeData || []);
      } catch (error) {
        console.error('Greška pri učitavanju grupa:', error);
      } finally {
        setLoading(false);
      }
    }

    if (tvrtkaId) {
      ucitajGrupe();
    }
  }, [tvrtkaId]);

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
