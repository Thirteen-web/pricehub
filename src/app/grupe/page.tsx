'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import GrupeUpravljanje from './GrupeUpravljanje';

export default function GrupePage() {
  const [loading, setLoading] = useState(true);
  const [grupe, setGrupe] = useState<any[]>([]);
  const [trenutnaTvrtkaId, setTrenutnaTvrtkaId] = useState<number>(1);

  useEffect(() => {
    async function ucitajPodatke() {
      try {
        // 1. Provjera ulogiranog korisnika na klijentu (preglednik vidi kolačić!)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }

        // 2. Dohvat profila korisnika kako bismo saznali ID njegove tvrtke
        const { data: profil } = await supabase
          .from('korisnici_profili')
          .select('tvrtka_id')
          .eq('id', user.id)
          .single();

        const tvrtkaId = profil?.tvrtka_id ? Number(profil.tvrtka_id) : 1;
        setTrenutnaTvrtkaId(tvrtkaId);

        // 3. Dohvaćanje grupa izolirano za tu tvrtku
        const { data: grupeData } = await supabase
          .from('grupe')
          .select('*')
          .eq('tvrtka_id', tvrtkaId)
          .order('naziv', { ascending: true });

        setGrupe(grupeData || []);
      } catch (error) {
        console.error('Greška pri učitavanju grupa na klijentu:', error);
      } finally {
        setLoading(false);
      }
    }

    ucitajPodatke();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-sm font-semibold text-gray-400 select-none animate-pulse">
        Učitavanje grupa proizvoda...
      </div>
    );
  }

  return (
    <main className="w-full pt-2">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Isctavamo tvoju postojeću klijentsku komponentu s čistim podacima */}
        <GrupeUpravljanje pocetneGrupe={grupe} tvrtkaId={trenutnaTvrtkaId} />
      </div>
    </main>
  );
}
