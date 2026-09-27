'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { prijavaKorisnika } from '../actions';
import { LockClosedIcon, EnvelopeIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // <--- Dodan uvoz ChartBarIcon

export default function LoginStranica() {
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [uTijeku, setUTijeku] = useState(false);
  const [greska, setGreska] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUTijeku(true);
    setGreska('');

    if (!email || !lozinka) {
      setGreska('Molimo unesite email i lozinku.');
      setUTijeku(false);
      return;
    }

    const res = await prijavaKorisnika(email, lozinka);
    
    if (res.success && res.token) {
      // Sigurno spremanje kolačića na klijentu
      document.cookie = `cjenik-session=${res.token}; path=/; max-age=${res.maxAge || 3600}; SameSite=Lax`;
      
      console.log('Kolačić postavljen. Preusmjeravam...');
      router.push('/');
      router.refresh();
    } else {
      setGreska('Pogrešan email ili lozinka. Pokušajte ponovno.');
      setUTijeku(false);
    }
  };

  const inputStil = "w-full pl-11 pr-4 py-2.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 font-medium";

  return (
    // Glavna pozadina koja reagira na temu
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      
      {/* Središnja kartica s prilagođenim dark: klasama */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 space-y-6 transition-colors duration-200">
        
        <div className="text-center">
          {/* SLUŽBENI LOGOTIP: Usklađen sa Sidebarom, plavi kvadrat i bijela vektorska ikona */}
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 items-center justify-center shadow-md shadow-blue-100 dark:shadow-none text-white select-none mb-4 animate-fade-in">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          
          {/* BRENDIRANI NASLOV: S dvo-tonskim PriceHub stilom */}
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Prijava u Price<span className="text-blue-600 dark:text-blue-400">Hub</span>
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1.5">Unesite administratorske podatke za pristup cjeniku</p>
        </div>

        {greska && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold p-3 rounded-xl border border-red-100/60 dark:border-red-900/30 text-center">
            {greska}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Email adresa</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </span>
              <input
                type="email"
                placeholder="admin@cjenik.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStil}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Lozinka</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <LockClosedIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={lozinka}
                onChange={(e) => setLozinka(e.target.value)}
                className={inputStil}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uTijeku}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-blue-100 dark:hover:shadow-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 text-sm mt-2"
          >
            {uTijeku ? 'Provjera podataka...' : 'Prijavi se'}
          </button>
        </form>

      </div>
    </div>
  );
}
