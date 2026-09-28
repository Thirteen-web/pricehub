'use client';

import { useState, useEffect } from 'react';
import { Grupe } from '@/types/database.types';
import { spremiGrupu, obrisiGrupu } from '../actions';
import { PlusIcon } from '@heroicons/react/24/outline';

interface GrupeUpravljanjeProps {
  pocetneGrupe: Grupe[];
  tvrtkaId: number; 
}

export default function GrupeUpravljanje({ pocetneGrupe, tvrtkaId }: GrupeUpravljanjeProps) {
  const [naziv, setNaziv] = useState('');
  const [uTijeku, setUTijeku] = useState(false);
  
  // Stanja za modal (dodavanje / uređivanje / brisanje)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'dodaj' | 'uredi' | 'obriši'>('dodaj');
  const [odabranaGrupa, setOdabranaGrupa] = useState<Grupe | null>(null);
  
  // Stanje za praćenje otvorenog mobilnog izbornika s tri točkice
  const [otvoreniMeniGrupaId, setOtvoreniMeniGrupaId] = useState<number | null>(null);

  const otvoriModal = (mode: 'dodaj' | 'uredi' | 'obriši', grupa: Grupe | null = null) => {
    setModalMode(mode);
    setOdabranaGrupa(grupa);
    setNaziv(grupa ? grupa.naziv : '');
    setIsModalOpen(true);
  };

  const handleSpremi = async (e: React.FormEvent) => {
    e.preventDefault();
    setUTijeku(true);

    if (modalMode === 'obriši' && odabranaGrupa) {
      const res = await obrisiGrupu(odabranaGrupa.id);
      if (res.success) setIsModalOpen(false);
      setUTijeku(false);
      return;
    }

    if (!naziv) {
      alert('Naziv grupe je obavezan!');
      setUTijeku(false);
      return;
    }

    const res = await (spremiGrupu as any)({
      id: odabranaGrupa?.id,
      naziv: naziv,
      tvrtka_id: tvrtkaId
    });

    if (res.success) {
      setIsModalOpen(false);
    } else {
      alert('Greška pri spremanju: ' + res.error);
    }
    setUTijeku(false);
  };

  const inputStil = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 font-medium placeholder-gray-400";

  return (
    <div className="space-y-6 w-full max-w-full">

       {/* NASLOV SEKCIJE - VRACEN ZA SAVRSEN VIZUALNI IDENTITET */}
      <div className="select-none">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Grupe proizvoda</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Upravljanje i organizacija kategorija artikala u cjeniku</p>
      </div>
      
      {/* Traka s gumbom za novu grupu */}
      <div className="flex justify-start items-center select-none">
        <button
          onClick={() => otvoriModal('dodaj')}
          className="bg-blue-600 hover:bg-emerald-600 dark:bg-blue-600 dark:hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-100 hover:shadow-emerald-100 dark:shadow-none transition-all flex items-center gap-2 text-sm active:scale-[0.98] group"
        >
          <PlusIcon className="w-5 h-5 text-white" />
          Nova grupa proizvoda
        </button>
      </div>

      {/* Tablica s grupama */}
      {pocetneGrupe.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center transition-colors">
          <p className="text-gray-400 dark:text-gray-500 text-lg font-medium">Nema kreiranih grupa proizvoda.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden transition-colors w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-full divide-y divide-gray-100 dark:divide-gray-800 table-fixed md:table-auto">
              <thead className="bg-gray-50/70 dark:bg-gray-800/50">
                <tr>
                  <th className="px-2 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID grupe</th>
                  <th className="px-2 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Naziv kategorije</th>
                  <th className="px-2 sm:px-6 py-3.5 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Akcije</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
                {pocetneGrupe.map((grupa) => (
                  <tr key={grupa.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-mono font-bold">
                      #{grupa.id}
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {grupa.naziv}
                    </td>
                    
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-medium align-middle relative">
                      {/* RAČUNALO PRIKAZ */}
                      <div className="hidden md:flex items-center justify-end gap-2 select-none">
                        <button
                          onClick={() => otvoriModal('uredi', grupa ? grupa : null)}
                          className="p-2.5 bg-gray-50 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-blue-900/60 border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg shadow-sm hover:shadow-md hover:shadow-blue-200/60 dark:hover:shadow-blue-900/40 transition-all duration-200 active:scale-[0.97] text-base"
                          title="Uredi grupu"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => otvoriModal('obriši', grupa ? grupa : null)}
                          className="p-2.5 bg-gray-50 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/60 border border-gray-100 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 rounded-lg shadow-sm hover:shadow-md hover:shadow-red-200/60 dark:hover:shadow-red-900/40 transition-all duration-200 active:scale-[0.97] text-base"
                          title="Obriši grupu"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* MOBITEL PRIKAZ (Tri točkice) */}
                      <div className="md:hidden inline-block text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOtvoreniMeniGrupaId(otvoreniMeniGrupaId === grupa.id ? null : grupa.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 font-bold text-xs transition-all active:scale-95"
                        >
                          •••
                        </button>

                        {otvoreniMeniGrupaId === grupa.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOtvoreniMeniGrupaId(null)} />
                            <div className="absolute right-2 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-20 p-2 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  setOtvoreniMeniGrupaId(null);
                                  otvoriModal('uredi', grupa);
                                }}
                                className="w-full px-3.5 py-3 text-sm font-bold text-left rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all flex items-center gap-2.5 active:scale-[0.97]"
                              >
                                <span className="text-base">✏️</span>
                                <span>Uredi grupu</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOtvoreniMeniGrupaId(null);
                                  otvoriModal('obriši', grupa);
                                }}
                                className="w-full px-3.5 py-3 text-sm font-bold text-left rounded-xl bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all flex items-center gap-2.5 active:scale-[0.97]"
                              >
                                <span className="text-base">🗑️</span>
                                <span>Obriši grupu</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERNI MODAL ZA UPRAVLJANJE GRUPAMA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 space-y-5 z-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {modalMode === 'dodaj' ? '✨ Dodaj novu grupu' : modalMode === 'uredi' ? '✏️ Uredi grupu' : '🗑️ Obriši grupu'}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Upravljanje kategorijama proizvoda za cjenik</p>
            </div>

            {modalMode === 'obriši' ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Jeste li sigurni da želite obrisati grupu <span className="font-bold text-gray-900 dark:text-gray-100">"{naziv}"</span>? Svi artikli u ovoj grupi ostat će bez dodijeljene kategorije.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Odustani</button>
                  <button type="button" onClick={handleSpremi} disabled={uTijeku} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50">Obriši grupu</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSpremi} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Naziv grupe / kategorije</label>
                  <input type="text" value={naziv} onChange={(e) => setNaziv(e.target.value)} className={inputStil} placeholder="Npr. Topli napitci, Alkoholna pića..." required />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Odustani</button>
                  <button type="submit" disabled={uTijeku} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50">
                    {uTijeku ? 'Spremanje...' : modalMode === 'dodaj' ? 'Dodaj grupu' : 'Spremi izmjene'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
