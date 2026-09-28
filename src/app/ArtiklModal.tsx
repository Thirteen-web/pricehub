'use client';

import { useState, useEffect } from 'react';
import { Artikli, Grupe } from '@/types/database.types';
import { spremiArtikl, obrisiArtikl } from './actions';

interface ArtiklModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'dodaj' | 'uredi' | 'obriši';
  artikl: Artikli | null;
  grupe: Grupe[];
  tvrtkaId: number; 
}

export default function ArtiklModal({ isOpen, onClose, mode, artikl, grupe, tvrtkaId }: ArtiklModalProps) {
  const [naziv, setNaziv] = useState('');
  const [grupaId, setGrupaId] = useState<number | null>(null);
  const [normativ, setNormativ] = useState('');
  const [sidrenaCijena, setSidrenaCijena] = useState('');
  const [cijena, setCijena] = useState('');
  const [uTijeku, setUTijeku] = useState(false);

  // Stanje za datum unosa - Sigurno čita YYYY-MM-DD iz baze ili postavlja današnji datum
  const [datumUnosa, setDatumUnosa] = useState(() => {
    if (artikl?.datum_unosa) {
      return artikl.datum_unosa.substring(0, 10);
    }
    const danas = new Date();
    const offset = danas.getTimezoneOffset();
    const lokalniDanas = new Date(danas.getTime() - (offset * 60 * 1000));
    return lokalniDanas.toISOString().substring(0, 10);
  });

  // Sinhronizacija podataka kada se otvori modal za uređivanje ili brisanje
  useEffect(() => {
    if (isOpen) {
      if (mode !== 'dodaj' && artikl) {
        setNaziv(artikl.naziv);
        setGrupaId(artikl.grupa_id);
        setNormativ(artikl.normativ || '');
        setSidrenaCijena(artikl.sidrena_cijena ? artikl.sidrena_cijena.toString() : '');
        setCijena(artikl.cijena.toString());
        
        if (artikl.datum_unosa) {
          setDatumUnosa(artikl.datum_unosa.substring(0, 10));
        } else {
          setDatumUnosa(new Date().toISOString().substring(0, 10));
        }
      } else {
        setNaziv('');
        setGrupaId(grupe.length > 0 ? grupe[0].id : null);
        setNormativ('');
        setSidrenaCijena('');
        setCijena('');
        
        const danas = new Date();
        const offset = danas.getTimezoneOffset();
        const lokalniDanas = new Date(danas.getTime() - (offset * 60 * 1000));
        setDatumUnosa(lokalniDanas.toISOString().substring(0, 10));
      }
    }
  }, [isOpen, mode, artikl, grupe]);

  if (!isOpen) return null;

  const handleSpremi = async (e: React.FormEvent) => {
    e.preventDefault();
    setUTijeku(true);

    if (mode === 'obriši' && artikl) {
      const res = await obrisiArtikl(artikl.id);
      if (res.success) onClose();
      setUTijeku(false);
      return;
    }

    if (!naziv || !cijena) {
      alert('Naziv i trenutna cijena su obavezni!');
      setUTijeku(false);
      return;
    }

    // Pozivamo Server Action funkciju iz actions.ts i ispravno šaljemo sve podatke zajedno s tvrtkaId
    const res = await spremiArtikl({
      id: artikl?.id,
      naziv,
      grupa_id: grupaId,
      normativ: normativ || null,
      sidrena_cijena: sidrenaCijena ? parseFloat(sidrenaCijena) : null,
      cijena: parseFloat(cijena),
      datum_unosa: new Date(datumUnosa).toISOString(),
      tvrtka_id: tvrtkaId, 
    });

    if (res.success) {
      onClose();
    } else {
      alert('Greška pri spremanju: ' + res.error);
    }
    setUTijeku(false);
  };

  const inputStil = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 font-medium placeholder-gray-400";

  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 dark:bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200"
      style={{ zIndex: 9999 }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 space-y-5 z-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'dodaj' ? '✨ Dodaj novi artikl' : mode === 'uredi' ? '✏️ Uredi artikl' : '🗑️ Obriši artikl'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Unesite podatke i zakonske vrijednosti za artikl</p>
        </div>

        {mode === 'obriši' ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Jeste li sigurni da želite trajno obrisati artikl <span className="font-bold text-gray-900 dark:text-gray-100">"{naziv}"</span>? Ova radnja se ne može poništiti.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Odustani</button>
              <button type="button" onClick={handleSpremi} disabled={uTijeku} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50">Obriši artikl</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSpremi} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Naziv artikla</label>
              <input type="text" value={naziv} onChange={(e) => setNaziv(e.target.value)} className={inputStil} placeholder="Npr. Ožujsko pivo 0.5L" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Grupa</label>
                <select value={grupaId || ''} onChange={(e) => setGrupaId(Number(e.target.value))} className={inputStil}>
                  {grupe.map((g) => (
                    <option key={g.id} value={g.id}>{g.naziv}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Normativ</label>
                <input type="text" value={normativ} onChange={(e) => setNormativ(e.target.value)} className={inputStil} placeholder="Npr. 0.5 L" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Cijena na dan 10.09.26</label>
                <input type="number" step="0.01" value={sidrenaCijena} onChange={(e) => setSidrenaCijena(e.target.value)} className={inputStil} placeholder="0.00 €" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Trenutna cijena</label>
                <input type="number" step="0.01" value={cijena} onChange={(e) => setCijena(e.target.value)} className={inputStil} placeholder="0.00 €" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
                📅 Datum unosa / promjene
              </label>
              <input
                type="date"
                value={datumUnosa}
                onChange={(e) => setDatumUnosa(e.target.value)}
                disabled={mode !== 'dodaj' && mode !== 'uredi'}
                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 transition-all font-medium disabled:opacity-50"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Odustani</button>
              <button type="submit" disabled={uTijeku} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50">
                {uTijeku ? 'Spremanje...' : mode === 'dodaj' ? 'Dodaj artikl' : 'Spremi izmjene'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
