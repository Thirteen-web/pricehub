'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { supabase } from '@/utils/supabase';
import { Bars3Icon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function LayoutKontejner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOtvoren, setSidebarOtvoren] = useState(false);
  
  // Stanja za fiksne podatke o firmi u zaglavlju
  const [firmaNaziv, setFirmaNaziv] = useState('Naziv tvrtke d.o.o.');
  const [firmaAdresa, setFirmaAdresa] = useState('Ulica i broj, Grad');
  const [firmaOib, setFirmaOib] = useState('00000000000');

  // Dohvaćanje postavki tvrtke izravno u krovno zaglavlje
  useEffect(() => {
    if (pathname === '/login') return;

    const dohvatiPostavkeFirme = async () => {
      try {
        const { data } = await supabase.from('postavke').select('kljuc, vrijednost');
        if (data) {
          const naziv = data.find((p: any) => p.kljuc === 'firma_naziv')?.vrijednost;
          const adresa = data.find((p: any) => p.kljuc === 'firma_adresa')?.vrijednost;
          const oib = data.find((p: any) => p.kljuc === 'firma_oib')?.vrijednost;

          if (naziv) setFirmaNaziv(naziv);
          if (adresa) setFirmaAdresa(adresa);
          if (oib) setFirmaOib(oib);
        }
      } catch (err) {
        console.error('Greška pri dohvaćanju memoranduma u headeru:', err);
      }
    };

    dohvatiPostavkeFirme();
  }, [pathname]);

  // Ako smo na login stranici, ne prikazujemo nikakve navigacijske elemente
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col antialiased font-sans">
      
      {/* ========================================================================= */}
      {/* 1. KROVNI HEADER - S VRACENIM PODACIMA O TVRTKI NA DESNOJ STRANI */}
      {/* ========================================================================= */}
      <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-200/80 dark:border-gray-700/60 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-45 select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        
        {/* LOGOTIP I NAZIV BRANDA (PriceHub) */}
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg md:text-xl tracking-tight">
            <span className="text-gray-900 dark:text-white">Price</span>
            <span className="text-blue-600 dark:text-blue-400">Hub</span>
          </span>
        </div>

          {/* DESNA STRANA NA LAPTOPU: Povećan font naziva tvrtke na 12px */}
        <div className="hidden md:flex flex-col text-right text-[11px] leading-tight text-gray-500 dark:text-gray-400 font-medium">
          <span className="font-bold text-gray-800 dark:text-gray-200 uppercase text-[12px] tracking-wide">{firmaNaziv}</span>
          <span>{firmaAdresa}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">OIB: {firmaOib}</span>
        </div>

        {/* DESNA STRANA NA MOBITELU: Hamburger gumb */}
        <button
          onClick={() => setSidebarOtvoren(!sidebarOtvoren)}
          className="p-2 md:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-colors"
        >
          {sidebarOtvoren ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. DONJA SEKCIJA: Otvara se ispod krovnog headera */}
      {/* ========================================================================= */}
      <div className="flex flex-1 flex-col md:flex-row min-w-0 w-full relative">
        
        {/* BOČNA TRAKA (SIDEBAR) */}
        <aside 
          className={`
            fixed inset-y-[53px] md:inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80
            transform md:transform-none md:sticky md:top-[53px] h-[calc(100vh-53px)] transition-transform duration-300 ease-in-out
            ${sidebarOtvoren ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar onAction={() => setSidebarOtvoren(false)} />
        </aside>

        {/* Zatamnjena pozadina (Overlay) kada je Sidebar otvoren na mobitelu */}
        {sidebarOtvoren && (
          <div 
            onClick={() => setSidebarOtvoren(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          />
        )}

        {/* GLAVNI SADRŽAJ (Radni prostor digitalnog cjenika) */}
        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  );
}
