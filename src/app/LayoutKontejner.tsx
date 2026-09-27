'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface LayoutKontejnerProps {
  children: React.ReactNode;
  firma: {
    naziv: string;
    adresa: string;
    oib: string;
  };
}

export default function LayoutKontejner({ children, firma }: LayoutKontejnerProps) {
  const pathname = usePathname();
  const jeLoginStranica = pathname === '/login';

  // AKO SMO NA LOGIN STRANICI: Vraćamo čisti sadržaj preko cijelog ekrana, BEZ HEADERA I SIDEBARA!
  if (jeLoginStranica) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        {children}
      </div>
    );
  }

  // ZA SVE OSTALE STRANICE: Prikazuje se puni ulašteni ERP izgled s fiksnim elementima
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* GLOBALNI HEADER */}
         <header className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] z-50 fixed top-0 left-0 h-20 transition-colors duration-200">
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100 dark:shadow-none shrink-0">
            <ChartBarIcon className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">
              Price<span className="text-blue-600 dark:text-blue-400">Hub</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1 leading-none">
              Verzija 1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 select-none">
          <div className="text-right leading-tight">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{firma.naziv}</h4>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{firma.adresa}</p>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono tracking-wide uppercase mt-0.5">OIB: {firma.oib}</p>
          </div>
          
          <Link 
            href="/postavke" 
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-xl transition-all active:scale-95"
            title="Opcije sustava"
          >
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.004.831a1.125 1.125 0 0 1 .26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.37.491l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.45 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.83c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356 1.33.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* STRUKTURA RADNOG PROSTORA */}
      <div className="flex flex-1 mt-20">
        
        {/* LIJEVO: Fiksni Sidebar */}
        <div className="w-64 fixed left-0 bottom-0 top-20 border-r border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors z-30">
          <Sidebar />
        </div>
        
        {/* DESNO: Centrirani radni prostor s ml-64 koji sprječava bježanje tablice pod izbornik */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 transition-colors p-4 pt-6 px-4 ml-64 flex justify-center min-w-0">
          <div className="w-full max-w-full">
            {children}
          </div>
        </div>

      </div>

    </div>
  );
}
