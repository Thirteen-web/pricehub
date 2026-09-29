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
  uloga?: string | null; // <--- Prihvaća ulogu sa servera
}

export default function LayoutKontejner({ children, firma, uloga }: LayoutKontejnerProps) {
  const pathname = usePathname();
  const [sidebarOtvoren, setSidebarOtvoren] = useState(false);
  
  const firmaNaziv = firma?.naziv || 'PriceHub Sustav';
  const firmaAdresa = firma?.adresa || '';
  const firmaOib = firma?.oib || '';

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col antialiased font-sans">
      
      <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-200/80 dark:border-gray-700/60 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        
             {/* PRIVREMENI TESTNI ISPIS ULOGE NA VRHU EKRANA */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-mono z-[99999]">
          DEBUG ULOGA: "{String(uloga)}"
        </div>

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

      <div className="flex flex-1 flex-col md:flex-row min-w-0 w-full relative">
             {/* BOČNA TRAKA: Okvir je ponovno savršeno zalijepljen uz donji rub zaglavlja (top-[53px]) */}
        <aside 
          className={`
            fixed top-[53px] bottom-0 left-0 z-50 md:z-40 w-64 bg-slate-50 dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80
            transform transition-transform duration-300 ease-in-out select-none h-[calc(100vh-53px)]
            ${sidebarOtvoren ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar onAction={() => setSidebarOtvoren(false)} uloga={uloga} />
        </aside>

        {/* ZATAMNJENA POZADINA (OVERLAY): Spuštena na z-42 kako bi stala TOČNO IZA sidebara, a ispred tablica */}
        {sidebarOtvoren && (
          <div 
            onClick={() => setSidebarOtvoren(false)}
            className="fixed inset-0 bg-black/30 z-42 md:hidden backdrop-blur-sm transition-opacity"
            style={{ top: '80px' }} // Počinje točno ispod headera
          />
        )}

        {sidebarOtvoren && (
          <div onClick={() => setSidebarOtvoren(false)} className="fixed inset-0 bg-black/40 z-45 md:hidden backdrop-blur-sm transition-opacity" />
        )}

         <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden md:pl-72 bg-slate-50 dark:bg-slate-900 transition-colors">
          {children}
        </main>
      </div>

    </div>
  );
}
