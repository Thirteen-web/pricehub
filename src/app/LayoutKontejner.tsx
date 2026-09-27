'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LayoutKontejner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOtvoren, setSidebarOtvoren] = useState(false);

  // Ako smo na login stranici, ne prikazujemo nikakve navigacijske elemente
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row antialiased font-sans">
      
      {/* 1. GORNJA NAVIGACIJSKA TRAKA ZA MOBITELE (Prikazuje se samo na malim ekranima) */}
      <header className="flex md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 items-center justify-between sticky top-0 z-40 select-none w-full">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span className="font-bold tracking-tight text-blue-600 dark:text-blue-400">PriceHub</span>
        </div>
        <button
          onClick={() => setSidebarOtvoren(!sidebarOtvoren)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          {sidebarOtvoren ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </header>

      {/* 2. BOČNA TRAKA (SIDEBAR): Na laptopu fiksna, na mobitelu se uvozi kao overlay */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80 h-full min-h-screen
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:transform-none md:translate-x-0
          ${sidebarOtvoren ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Unutarnji logotip unutar Sidebara (Prikazuje se isključivo na desktopu / laptopu) */}
        <div className="hidden md:flex items-center gap-2 px-6 pt-6 pb-2 select-none">
          <span className="text-2xl">📊</span>
          <span className="font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">PriceHub</span>
        </div>

        <Sidebar onAction={() => setSidebarOtvoren(false)} />
      </aside>

      {/* Zatamnjena pozadina (Overlay) kada je Sidebar otvoren na mobitelu */}
      {sidebarOtvoren && (
        <div 
          onClick={() => setSidebarOtvoren(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 3. GLAVNI RADNI PROSTOR (Sadržaj + Glavni desktop Header) */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        
        {/* VRACENI DESKTOP HEADER (Prikazuje se samo na laptopu/računalu, skriva se na mobitelu) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800/80 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
              Administracija sustava
            </span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Verzija 1.0.0 (Produkcija)
          </div>
        </header>

        {/* Glavni sadržaj stranice (Radni prostor cjenika) */}
        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

    </div>
  );
}
