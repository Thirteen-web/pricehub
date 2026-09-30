'use client';

import React, { useState } from 'react';
import { uvoziArtikleIzTablice } from './actions';

interface PametniUvozModalProps {
  isOpen: boolean;
  onClose: () => void;
  tvrtkaId: number;
  onUspjeh: () => void;
}

export default function PametniUvozModal({ isOpen, onClose, tvrtkaId, onUspjeh }: PametniUvozModalProps) {
  const [siroviRedovi, setSiroviRedovi] = useState<any[]>([]);
  const [detektiraniStupci, setDetektiraniStupci] = useState<string[]>([]);
  const [korak, setKorak] = useState(1); // 1 = Datoteka, 2 = Mapiranje
  const [uTijeku, setUTijeku] = useState(false);
  const [mapa, setMapa] = useState({ naziv: '', cijena: '', grupa: '', normativ: '' });

  if (!isOpen) return null;

  // Čitanje datoteke (CSV, XML, HTML) i izvlačenje zaglavlja stupaca
  const obradiDatoteku = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const tekst = event.target?.result as string;

      if (file.name.endsWith('.csv')) {
        const separator = tekst.includes(';') ? ';' : ',';
        const linije = tekst.split('\n').map(l => l.trim()).filter(Boolean);
        if (linije.length > 0) {
          const zaglavlje = linije[0].split(separator).map(s => s.replace(/["\r]/g, '').trim());
          setDetektiraniStupci(zaglavlje);
          const podaci = linije.slice(1).map(linija => {
            const celije = linija.split(separator).map(s => s.replace(/["\r]/g, '').trim());
            const objekt: any = {};
            zaglavlje.forEach((stupac, i) => { objekt[stupac] = celije[i]; });
            return objekt;
          });
          setSiroviRedovi(podaci);
          setKorak(2);
        }
      } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(tekst, 'text/html');
        const redoviHtml = Array.from(doc.querySelectorAll('tr'));
        if (redoviHtml.length > 0) {
          const zaglavlje = Array.from(redoviHtml[0].querySelectorAll('th, td')).map(el => el.textContent?.trim() || '');
          setDetektiraniStupci(zaglavlje.filter(Boolean));
          const podaci = redoviHtml.slice(1).map(red => {
            const celije = Array.from(red.querySelectorAll('td')).map(el => el.textContent?.trim() || '');
            const objekt: any = {};
            zaglavlje.forEach((stupac, i) => { if (stupac) objekt[stupac] = celije[i]; });
            return objekt;
          });
          setSiroviRedovi(podaci.filter(obj => Object.keys(obj).length > 0));
          setKorak(2);
        }
      }
    };
    reader.readAsText(file, 'UTF-8');
  };
  // Čišćenje, Upsert prilagodba i slanje podataka u bazu
  const pokreniUvozSustava = async () => {
    if (!mapa.naziv || !mapa.cijena) return;
    setUTijeku(true);

    const prilagodjeniArtikli = siroviRedovi.map(red => {
      const sirovaCijenaText = String(red[mapa.cijena] || '0');
      const ociscenaCijena = parseFloat(sirovaCijenaText.replace(/[^0-9.,]/g, '').replace(',', '.'));
    return {
  naziv: red[mapa.naziv]?.trim() || '',
  cijena: isNaN(ociscenaCijena) ? 0 : ociscenaCijena,
  grupa_naziv: mapa.grupa && red[mapa.grupa] ? red[mapa.grupa].trim() : 'Ostalo',
  normativ: mapa.normativ && red[mapa.normativ] ? red[mapa.normativ].trim() : 'kom' // <--- DODANO Polje!
};

    }).filter(a => a.naziv !== '');

    const res = await uvoziArtikleIzTablice({ tvrtka_id: tvrtkaId, artikli: prilagodjeniArtikli });
    if (res.success) {
      alert(`Uvoz završen! ✨\nNovi artikli: ${res.unesenih}\nAžurirane cijene: ${res.azuriranih}`);
      onUspjeh(); setKorak(1); setSiroviRedovi([]); onClose();
    } else {
      alert('Greška pri uvozu: ' + res.error);
    }
    setUTijeku(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={uTijeku ? undefined : onClose} />
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg z-10 overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col text-gray-900 dark:text-gray-100">
        <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-base font-bold">{korak === 1 ? '📥 Korak 1: Datoteka cjenika' : '✏️ Korak 2: Spajanje stupaca'}</h3>
          <button onClick={onClose} disabled={uTijeku} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        <div className="p-6">
          {korak === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Učitajte vanjski cjenik (.csv, .xml, .html) izvezen iz blagajne.</p>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center bg-gray-50/30 relative cursor-pointer group">
                <input type="file" accept=".csv, .html, .htm, .xml" onChange={obradiDatoteku} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">📊 Kliknite ovdje i odaberite datoteku</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stupac za NAZIV *</label>
                <select value={mapa.naziv} onChange={e => setMapa({...mapa, naziv: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm font-semibold dark:bg-gray-800 dark:border-gray-750">
                  <option value="">-- Odaberite stupac s nazivom --</option>
                  {detektiraniStupci.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stupac za NORMATIV / MJERU (Opcionalno)</label>
  <select value={mapa.normativ} onChange={e => setMapa({...mapa, normativ: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm font-semibold dark:bg-gray-800 dark:border-gray-750">
    <option value="">-- Bez mjerne jedinice (Sve automatski ide u 'kom') --</option>
    {detektiraniStupci.map(s => <option key={s} value={s}>{s}</option>)}
  </select>
</div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stupac za CIJENU *</label>
                <select value={mapa.cijena} onChange={e => setMapa({...mapa, cijena: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm font-semibold dark:bg-gray-800 dark:border-gray-750">
                  <option value="">-- Odaberite stupac s cijenom --</option>
                  {detektiraniStupci.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stupac za GRUPU (Opcionalno)</label>
                <select value={mapa.grupa} onChange={e => setMapa({...mapa, grupa: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm font-semibold dark:bg-gray-800 dark:border-gray-750">
                  <option value="">-- Bez grupe (Sve ide u 'Ostalo') --</option>
                  {detektiraniStupci.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} disabled={uTijeku} className="px-4 py-2 border rounded-xl text-sm font-semibold text-gray-600 bg-white dark:bg-gray-900">Odustani</button>
          {korak === 2 && (
            <button onClick={pokreniUvozSustava} disabled={uTijeku || !mapa.naziv || !mapa.cijena} className="px-5 py-2 bg-blue-600 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold">
              {uTijeku ? 'Uvoz...' : `Pokreni uvoz (${siroviRedovi.length} stavki)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
