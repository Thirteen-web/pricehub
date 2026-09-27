'use server';

import { supabase } from '@/utils/supabase';
import GrupeUpravljanje from './GrupeUpravljanje';

async function getGrupePodaci() {
  // Dohvaćamo sve grupe i sortiramo ih abecedno
  const { data: grupe } = await supabase
    .from('grupe')
    .select('*')
    .order('naziv', { ascending: true });

  return (grupe as any[]) || [];
}

export default async function GrupeStranica() {
  const grupe = await getGrupePodaci();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-2 transition-colors duration-200">
      <div className="w-full space-y-6 px-5 pb-5">
        <header className="mb-6 border-b border-gray-200/60 dark:border-gray-600 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grupe proizvoda</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Upravljanje kategorijama i razvrstavanjem artikala u cjeniku</p>
          </div>
        </header>
        <GrupeUpravljanje pocetneGrupe={grupe} />
      </div>
    </main>
  );
}
