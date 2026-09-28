'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface LayoutKontejnerProps {
  children: React.ReactNode;
  firma?: {
    naziv: string;
    adresa: string;
    oib: string;
  };
}

export default function LayoutKontejner({ children, firma }: LayoutKontejnerProps) {
  const pathname = usePathname();
  const [sidebarOtvoren, setSidebarOtvoren] = useState(false);
  
  // Koristimo podatke prosljeđene sa servera, ili fallback ako ih privremeno nema (npr. na login stranici)
  const firmaNaziv = firma?.naziv || 'PriceHub Sustav';
  const firmaAdresa = firma?.adresa || '';
  const firmaOib = firma?.oib || '';

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col antialiased font-sans">
      
      <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-200/80 dark:border-gray-700/60 px-4 md:px-8 py-3  flex items-center justify-between sticky top-0 z-50 select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg md:text-xl tracking-tight">
            <span className="text-gray-900 dark:text-white">Price</span>
            <span className="text-blue-600 dark:text-blue-400">Hub</span>
          </span>
        </div>

        <div className="hidden md:flex flex-col text-right text-[11px] leading-tight text-gray-500 dark:text-gray-400 font-medium">
          <span className="font-bold text-gray-800 dark:text-gray-200 uppercase text-[12px] tracking-wide">{firmaNaziv}</span>
          <span>{firmaAdresa}</span>
          {firmaOib && <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">OIB: {firmaOib}</span>}
        </div>

        <button
          onClick={() => setSidebarOtvoren(!sidebarOtvoren)}
          className="p-2 md:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-colors"
        >
          {sidebarOtvoren ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </header>

            {/* ========================================================================= */}
      {/* 2. DONJA SEKCIJA: h-[calc(100vh-53px)] zaključava visinu ispod headera */}
      {/* ========================================================================= */}
      <div className="flex flex-1 flex-col md:flex-row min-w-0 w-full relative">
        
        {/* BOČNA TRAKA: Prebačena u 'md:fixed' - sada je fizički nemoguće da se pomakne ili skrola! */}
        <aside 
          className={`
            fixed inset-y-[53px] left-0 z-40 w-64 bg-slate-50 dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80
            transform md:transform-none h-[calc(100vh-53px)] transition-transform duration-300 ease-in-out select-none
            ${sidebarOtvoren ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar onAction={() => setSidebarOtvoren(false)} />
        </aside>

        {/* Zatamnjena pozadina (Overlay) za mobilne uređaje */}
        {sidebarOtvoren && (
          <div 
            onClick={() => setSidebarOtvoren(false)}
            className="fixed inset-0 bg-black/40 z-45 md:hidden backdrop-blur-sm transition-opacity"
          />
        )}

        {/* GLAVNI SADRŽAJ (Radni prostor): Dodana klasa md:pl-64 koja stvara savršen prostor za fiksnu traku */}
        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden md:pl-72 bg-slate-50 dark:bg-gray-950 transition-colors">
          {children}
        </main>

      </div>


    </div>
  );
}
