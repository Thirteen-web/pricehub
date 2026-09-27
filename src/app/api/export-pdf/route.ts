import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    // 1. Dohvaćanje svih postavki (podaci o tvrtki i zakonska napomena)
    const { data: postavke, error: postError } = await supabase
      .from('postavke')
      .select('kljuc, vrijednost');

    if (postError) throw postError;

      // 2. Dohvaćanje artikala - SORTIRANO: prvo po ID-u grupe, a unutar grupe abecedno po nazivu artikla
    const { data: artikli, error: artError } = await supabase
      .from('artikli')
      .select('*, grupe(naziv)')
      .order('grupa_id', { ascending: true }) // 1. Razvrstavanje po grupama proizvoda
      .order('naziv', { ascending: true });   // 2. Abecedni red unutar svake pojedine grupe

    if (artError) throw artError;

    // 3. Vraćanje čistih i spojenih podataka klijentskoj strani u JSON formatu
    return NextResponse.json({ postavke, artikli }, { status: 200 });

  } catch (error: any) {
    console.error('Greška unutar API rute za PDF:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
