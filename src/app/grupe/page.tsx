'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Uvozimo čitač URL parametara
import { supabase } from '@/utils/supabase';
import GrupeUpravljanje from './GrupeUpravljanje';

export default function GrupePage() {
  const [loading, setLoading] = useState(true);
  const [grupe, setGrupe] = useState<any[]>([]);
  
  const searchParams = useSearchParams();
  // Čitamo tvrtka_id izravno iz URL-a, uz fallback na 1
  const tvrtkaId = Number(searchParams.get('tvrtka_id') || '1');

  useEffect(() => {
    async function ucitajGrupe() {
      try {
        // Dohvaćamo grupe izravno preko sigurnog i preciznog URL ID-ja tvrtke!
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
