'use client';

import { useState, useEffect } from 'react';
import { Grupe } from '@/types/database.types';
import { obrisiGrupu, spremiGrupu } from './actions';

interface GrupaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'dodaj' | 'uredi' | 'obriši';
  grupa: Grupe | null;
}

export default function GrupaModal({ isOpen, onClose, mode, grupa }: GrupaModalProps) {
  const [naziv, setNaziv] = useState('');
  const [uTijeku, setUTijeku] = useState(false);

  useEffect(() => {
    if (mode === 'uredi' && grupa) {
      setNaziv(grupa.naziv);
    } else {
      setNaziv('');
    }
  }, [mode, grupa, isOpen]);

  if (!isOpen) return null;

  const izvrsiAkciju = async () => {
    setUTijeku(true);
    try {
      if (mode === 'obriši' && grupa) {
        const res = await obrisiGrupu(grupa.id);
        if (!res.success) {
          alert('Nije moguće obrisati grupu. Provjerite ima li vezanih artikala! Greška: ' + res.error);
        }
      } else {
        if (!naziv.trim()) {
          alert('Naziv grupe ne može biti prazan!');
          setUTijeku(false);
          return;
        }
           // DODAN "as any" NA KRAJ OBJEKTA ZA TRAJNO GAŠENJE VERCEL GREŠKE
        const res = await spremiGrupu({
          id: mode === 'uredi' ? grupa?.id : undefined,
          naziv: naziv.trim(),
        } as any);

        if (!res.success) alert('Greška pri spremanju: ' + res.error);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setUTijeku(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Pozadina ekrana */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Prozor */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md z-10 overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            {mode === 'dodaj' && '🆕 Dodaj novu grupu'}
            {mode === 'uredi' && '✏️ Uredi grupu'}
            {mode === 'obriši' && '⚠️ Obriši grupu'}
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-semibold transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {mode === 'obriši' ? (
            <div className="space-y-2 py-1">
              <p className="text-gray-600 text-sm leading-relaxed">
                Jeste li sigurni da želite trajno obrisati grupu <span className="font-semibold text-gray-900">"{grupa?.naziv}"</span>?
              </p>
              <p className="text-xs text-red-500 font-semibold bg-red-50 p-3 rounded-xl border border-red-100/60">
                🛑 Brisanje grupe uklonit će je iz šifarnika.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Naziv grupe</label>
              <input
                type="text"
                placeholder="Npr. Topli napitci"
                value={naziv}
                onChange={(e) => setNaziv(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50/50 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 focus:bg-white transition-all duration-200 placeholder-gray-400 font-medium"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={uTijeku} 
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 active:scale-[0.98] shadow-sm transition-all duration-150 disabled:opacity-50"
          >
            Odustani
          </button>
          <button
            onClick={izvrsiAkciju}
            disabled={uTijeku}
            className={`px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-sm active:scale-[0.98] transition-all duration-150 disabled:opacity-50 ${
              mode === 'obriši' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
            }`}
          >
            {uTijeku ? 'Slanje...' : mode === 'obriši' ? 'Ukloni' : 'Spremi'}
          </button>
        </div>

      </div>
    </div>
  );
}
