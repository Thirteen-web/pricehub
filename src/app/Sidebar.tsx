'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { 
  DocumentTextIcon, 
  FolderIcon,
  PrinterIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon,
  ArrowDownTrayIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabase';

export default function Sidebar(props: any) {
  const onAction = props.onAction;
  const uloga = props.uloga;
  const imaPodataka = props.imaPodataka;
  const tvrtkaId = props.tvrtkaId || 1;

  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const dobiStilGumba = (ciljanaPutanja: string) => {
    // Čista i robusna provjera koja radi u svim produkcijskim uvjetima
    const jeAktivna = ciljanaPutanja === '/' 
      ? pathname === '/' 
      : (pathname === ciljanaPutanja || pathname.startsWith(ciljanaPutanja));

    if (jeAktivna) {
      return "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-all group w-full text-left cursor-pointer";
    }
    return "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all group w-full text-left cursor-pointer";
  };

  if (!mounted) return null;
  return (
    <div className="h-full flex flex-col justify-between p-4 pt-14 pb-8 select-none bg-white dark:bg-gray-950">
      
      <nav className="flex-1 space-y-2">
        {/* 1. DIGITALNI CJENIK */}
        <Link href="/" onClick={onAction} className={dobiStilGumba('/')}>
          <DocumentTextIcon className="w-5 h-5" />
          <span>Digitalni cjenik</span>
        </Link>

        {/* 2. GRUPE PROIZVODA - VRAĆEN STIL I ONCLICK AKCIJA */}
        <Link href={`/grupe?tvrtka_id=${tvrtkaId}`} onClick={onAction} className={dobiStilGumba('/grupe')}>
          <FolderIcon className="w-5 h-5" />
          <span>Grupe proizvoda</span>
        </Link>

        {/* 3. POSTAVKE SUSTAVA - VRAĆEN STIL I ONCLICK AKCIJA */}
        <Link href={`/postavke?tvrtka_id=${tvrtkaId}`} onClick={onAction} className={dobiStilGumba('/postavke')}>
          <Cog6ToothIcon className="w-5 h-5" />
          <span>Postavke sustava</span>
        </Link>

        {uloga === 'admin' && (
          <Link href="/admin" onClick={onAction} className={dobiStilGumba('/admin')}>
            <span>👑</span>
            <span>Superadmin panel</span>
          </Link>
        )}

        <div className="my-4 border-t border-gray-100 dark:border-gray-800/60 pt-2" />

        {/* 4. PDF ISPIS */}
        <a 
          href={`/api/export-pdf?tvrtka_id=${tvrtkaId}&t=${Date.now()}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={onAction}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all group w-full text-left"
        >
          <PrinterIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <span>Ispis cjenika (PDF)</span>
        </a>

        {/* 5. CSV IZVOZ */}
        {!imaPodataka ? (
          <div className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-400 dark:text-gray-600 opacity-40 cursor-not-allowed select-none">
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-300 dark:text-gray-700" />
            <span>Izvoz podataka (CSV)</span>
          </div>
        ) : (
          <Link 
            href={`/api/export-csv?tvrtka_id=${tvrtkaId}`}
            onClick={onAction} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all group w-full text-left"
          >
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            <span>Izvoz podataka (CSV)</span>
          </Link>
        )}

        {/* 6. XML IZVOZ */}
        {!imaPodataka ? (
          <div className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-400 dark:text-gray-600 opacity-40 cursor-not-allowed select-none">
            <CodeBracketIcon className="w-5 h-5 text-gray-300 dark:text-gray-700" />
            <span>Izvoz cjenika (XML)</span>
          </div>
        ) : (
          <Link 
            href={`/api/export-xml?tvrtka_id=${tvrtkaId}`} 
            onClick={onAction} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all group w-full text-left"
          >
            <CodeBracketIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            <span>Izvoz cjenika (XML)</span>
          </Link>
        )}
      </nav>

      {/* DONJA GRUPA: MOON / SUN & LOGOUT */}
      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all w-full text-left cursor-pointer"
        >
          {theme === 'dark' ? (
            <><SunIcon className="w-5 h-5 text-amber-500" /><span>Svijetli način</span></>
          ) : (
            <><MoonIcon className="w-5 h-5 text-blue-600" /><span>Tamni način</span></>
          )}
        </button>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            document.cookie = 'cjenik-session=; Max-Age=0; path=/;';
            if (onAction) onAction();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/20 transition-all w-full text-left mt-2 select-none group cursor-pointer"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500 dark:text-gray-500 dark:group-hover:text-red-400" />
          <span>Odjava iz sustava</span>
        </button>
      </div>

    </div>
  );
}
