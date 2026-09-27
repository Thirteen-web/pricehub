'use client';

import { useState } from 'react';
import { spremiSvePostavke } from '../actions';

interface PostavkeFormaProps {
  inicijalnePostavke: {
    zakonska_napomena: string;
    firma_naziv: string;
    firma_adresa: string;
    firma_oib: string;
  };
}

export default function PostavkeForma({ inicijalnePostavke }: PostavkeFormaProps) {
  const [napomena, setNapomena] = useState(inicijalnePostavke.zakonska_napomena);
  const [naziv, setNaziv] = useState(inicijalnePostavke.firma_naziv);
  const [adresa, setAdresa] = useState(inicijalnePostavke.firma_adresa);
  const [oib, setOib] = useState(inicijalnePostavke.firma_oib);
  
  const [uTijeku, setUTijeku] = useState(false);
  const [poruka, setPoruka] = useState({ tip: '', tekst: '' });

  const handleSpremi = async () => {
    setUTijeku(true);
    setPoruka({ tip: '', tekst: '' });

    if (!naziv || !adresa || !oib) {
      setPoruka({ tip: 'greska', tekst: 'Sva polja o tvrtki su obavezna!' });
      setUTijeku(false);
      return;
    }

    const res = await spremiSvePostavke({
      zakonska_napomena: napomena,
      firma_naziv: naziv,
      firma_adresa: adresa,
      firma_oib: oib
    });

      if (res.success) {
      setPoruka({ tip: 'uspjeh', tekst: 'Sve postavke i podaci o tvrtki su uspješno spremljeni!' });
      
      // Brojač: Nakon 3 sekunde (3000 milisekundi) brišemo statusnu poruku s ekrana
      setTimeout(() => {
        setPoruka({ tip: '', tekst: '' });
      }, 3000);

    } else {
      setPoruka({ tip: 'greska', tekst: 'Greška pri spremanju: ' + res.error });
      
      // Također brišemo i grešku nakon 3 sekunde radi čistoće
      setTimeout(() => {
        setPoruka({ tip: '', tekst: '' });
      }, 3000);
    }
    setUTijeku(false);
  };

  // Ažurirani stil za input polja s podrškom za tamni način rada
const inputStil = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 font-medium placeholder-gray-400";

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">

      
      {/* ODJELJAK: PODACI O TVRTKI */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider border-b border-blue-50 pb-2">Podaci o tvrtki / obrtu</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Naziv tvrtke</label>
            <input
              type="text"
              value={naziv}
              onChange={(e) => setNaziv(e.target.value)}
              className={inputStil}
              placeholder="Npr. Moja Tvrtka d.o.o."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">OIB tvrtke</label>
            <input
              type="text"
              value={oib}
              onChange={(e) => setOib(e.target.value)}
              className={inputStil}
              placeholder="Npr. OIB:"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Adresa sjedišta / objekta</label>
          <input
            type="text"
            value={adresa}
            onChange={(e) => setAdresa(e.target.value)}
            className={inputStil}
            placeholder="Npr. Ulica Kralja Tomislava 10, 10000 Zagreb"
          />
        </div>
      </div>

      {/* ODJELJAK: ZAKONSKA NAPOMENA */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider border-b border-blue-50 pb-2">Zakonska napomena na dnu PDF cjenika</h3>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2.5">
            Savjet: Svaku rečenicu odvojite u novi red (pritisnite Enter) kako bi se u PDF-u ispisala kao zasebna stavka s točkom.
          </p>
          <textarea
            rows={6}
            value={napomena}
            onChange={(e) => setNapomena(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 focus:bg-white transition-all duration-200 font-medium leading-relaxed"
            placeholder="Upišite zakonski tekst..."
          />
        </div>
      </div>

    {/* STATUSNA PORUKA: PRIGUŠENA ZELENA KOJA PODSVJESNO JAVLJA USPJEH, ALI NE BLJEŠTI */}
      {poruka.tekst && (
        <div className={`text-xs font-bold tracking-wide transition-all duration-300 select-none ${
          poruka.tip === 'uspjeh' 
            ? 'text-emerald-600/80 dark:text-emerald-500/70' 
            : 'text-red-600/80 dark:text-red-500/70'
        }`}>
          {poruka.tip === 'uspjeh' ? '✓ ' : '✕ '} {poruka.tekst}
        </div>
      )}

      {/* GUMB ZA SPREMANJE: USKLAĐEN S OSTATKOM PRICEHUBA (PLAVI STIL I VEKTORSKA IKONA) */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSpremi}
          disabled={uTijeku}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-100 dark:shadow-none transition-all flex items-center gap-2 text-sm active:scale-[0.98] disabled:opacity-50"
        >
          {/* Ugrađena vektorska ikona kvačice/provjere (CheckIcon) za profesionalan ERP izgled */}
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {uTijeku ? 'Spremanje...' : 'Spremi opcije'}
        </button>
      </div>

    </div>
  );
}
