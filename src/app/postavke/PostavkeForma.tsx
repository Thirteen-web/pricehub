'use client';

import { useState } from 'react';
import { spremiSvePostavke } from '../actions';

interface PostavkeFormaProps {
  pocetnePostavke: {
    tvrtka_id: number;
    firma_naziv: string;
    firma_adresa: string;
    firma_oib: string;
    zakonska_napomena: string;
  };
}

export default function PostavkeForma({ pocetnePostavke }: PostavkeFormaProps) {
  const [firmaNaziv, setFirmaNaziv] = useState(pocetnePostavke.firma_naziv);
  const [firmaAdresa, setFirmaAdresa] = useState(pocetnePostavke.firma_adresa);
  const [firmaOib, setFirmaOib] = useState(pocetnePostavke.firma_oib);
  const [zakonskaNapomena, setZakonskaNapomena] = useState(pocetnePostavke.zakonska_napomena);
  const [uTijeku, setUTijeku] = useState(false);
  const [poruka, setPoruka] = useState<{ tip: 'uspjeh' | 'greska'; tekst: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUTijeku(true);
    setPoruka(null);

    if (!firmaNaziv || !firmaOib) {
      setPoruka({ tip: 'greska', tekst: 'Naziv tvrtke i OIB su obavezna polja!' });
      setUTijeku(false);
      return;
    }

    // Pozivamo Server Action funkciju i šaljemo joj sve ulaštene podatke
    const res = await spremiSvePostavke({
      tvrtka_id: pocetnePostavke.tvrtka_id,
      firma_naziv: firmaNaziv,
      firma_adresa: firmaAdresa,
      firma_oib: firmaOib,
      zakonska_napomena: zakonskaNapomena
    });

    if (res.success) {
      setPoruka({ tip: 'uspjeh', tekst: 'Podaci o tvrtki i zakonske napomene su uspješno spremljeni! ✨' });
      // Automatsko osvježavanje stranice nakon 1.5 sekunde kako bi krovni header odmah povukao novi naziv
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setPoruka({ tip: 'greska', tekst: 'Greška pri spremanju: ' + res.error });
    }
    setUTijeku(false);
  };

  const inputStil = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 font-medium placeholder-gray-400";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-5 transition-colors">
      
      {/* Obavijesti o statusu spremanja */}
      {poruka && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${
          poruka.tip === 'uspjeh' 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          {poruka.tekst}
        </div>
      )}

      {/* 1. SEKCIJA: Memorandum tvrtke */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">🏢 Podaci o tvrtki (Memorandum)</h3>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Naziv tvrtke d.o.o. / obrt</label>
          <input type="text" value={firmaNaziv} onChange={(e) => setFirmaNaziv(e.target.value)} className={inputStil} placeholder="Npr. Moje poduzeće d.o.o." required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Adresa i sjedište</label>
            <input type="text" value={firmaAdresa} onChange={(e) => setFirmaAdresa(e.target.value)} className={inputStil} placeholder="Npr. Glavna ulica 10, Zagreb" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">OIB tvrtke</label>
            <input type="text" maxLength={11} value={firmaOib} onChange={(e) => setFirmaOib(e.target.value)} className={inputStil} placeholder="11 znamenki" required />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800/60 my-2" />

      {/* 2. SEKCIJA: Zakonske napomene za PDF ispis */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">⚖️ Zakonske napomene na dnu PDF cjenika</h3>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tekst napomene (PDV, prigovori, sidrenje...)</label>
          <textarea 
            rows={4} 
            value={zakonskaNapomena} 
            onChange={(e) => setZakonskaNapomena(e.target.value)} 
            className={`${inputStil} resize-none leading-relaxed font-normal`}
            placeholder="Npr. U cijene je uračunat PDV. Sukladno čl. 10 Zakona o zaštiti potrošača..."
          />
        </div>
      </div>

      {/* Gumb za spremanje */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={uTijeku}
          className="bg-blue-600 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-100 dark:shadow-none hover:shadow-emerald-100 transition-all text-sm active:scale-[0.98] disabled:opacity-50"
        >
          {uTijeku ? 'Spremanje...' : 'Spremi sve postavke'}
        </button>
      </div>

    </form>
  );
}
