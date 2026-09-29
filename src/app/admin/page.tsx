'use client';

import { useState } from 'react';
import { kreirajNovuTvrtkuIKorisnika } from '../actions';

export default function AdminPage() {
  const [uTijeku, setUTijeku] = useState(false);
  const [poruka, setPoruka] = useState<{ tip: 'uspjeh' | 'greska'; tekst: string } | null>(null);

  // Form states
  const [nazivTvrtke, setNazivTvrtke] = useState('');
  const [adresaTvrtke, setAdresaTvrtke] = useState('');
  const [oibTvrtke, setOibTvrtke] = useState('');
  const [emailKorisnika, setEmailKorisnika] = useState('');
  const [lozinkaKorisnika, setLozinkaKorisnika] = useState('');
  const [imePrezime, setImePrezime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUTijeku(true);
    setPoruka(null);

    if (!nazivTvrtke || !oibTvrtke || !emailKorisnika || !lozinkaKorisnika) {
      setPoruka({ tip: 'greska', tekst: 'Sva polja s zvjezdicom (*) su obavezna!' });
      setUTijeku(false);
      return;
    }

    const res = await kreirajNovuTvrtkuIKorisnika({
      naziv_tvrtke: nazivTvrtke,
      adresa_tvrtke: adresaTvrtke,
      oib_tvrtke: oibTvrtke,
      email_korisnika: emailKorisnika,
      lozinka_korisnika: lozinkaKorisnika,
      ime_prezime: imePrezime || 'Vlasnik tvrtke'
    });

    if (res.success) {
      setPoruka({ tip: 'uspjeh', tekst: `✨ Tvrtka "${nazivTvrtke}" i korisnik uspješno su kreirani u sustavu!` });
      // Reset polja forme nakon uspješnog slanja
      setNazivTvrtke(''); setAdresaTvrtke(''); setOibTvrtke('');
      setEmailKorisnika(''); setLozinkaKorisnika(''); setImePrezime('');
    } else {
      setPoruka({ tip: 'greska', tekst: 'Greška pri kreiranju: ' + res.error });
    }
    setUTijeku(false);
  };

  const inputStil = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium placeholder-gray-400";

  return (
    // 1. KROVNI OMOTAČ: Dodana klasa items-start koja prisiljava sve elemente unutar main-a na lijevu stranu
    <main className="w-full pt-2 flex flex-col items-start justify-start">
      
      {/* 2. KONTEJNER FORME: Postavljen ml-0 i w-full za stabilno fiksiranje uz lijevi rub */}
      <div className="w-full max-w-3xl ml-0 space-y-6">
        <div className="select-none">
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">👑 Superadmin Panel</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Registracija novih tvrtki i automatsko generiranje njihovih zaključanih cjenika</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 transition-colors">
          {poruka && (
            <div className={`p-4 rounded-xl text-sm font-semibold border ${
              poruka.tip === 'uspjeh' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            }`}>{poruka.tekst}</div>
          )}

          {/* SEKCIJA 1: Podaci o novoj firmi */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">🏢 1. Podaci o novoj tvrtki</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Naziv tvrtke / obrta *</label>
              <input type="text" value={nazivTvrtke} onChange={(e) => setNazivTvrtke(e.target.value)} className={inputStil} placeholder="Npr. Restoran Primorka d.o.o." required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Adresa i sjedište</label>
                <input type="text" value={adresaTvrtke} onChange={(e) => setAdresaTvrtke(e.target.value)} className={inputStil} placeholder="Ulica, broj, Grad" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">OIB tvrtke *</label>
                <input type="text" maxLength={11} value={oibTvrtke} onChange={(e) => setOibTvrtke(e.target.value)} className={inputStil} placeholder="11 znamenki" required />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/60 my-2" />

          {/* SEKCIJA 2: Podaci o korisničkom računu */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">🔐 2. Pristupni podaci za klijenta</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Ime i prezime vlasnika / voditelja</label>
              <input type="text" value={imePrezime} onChange={(e) => setImePrezime(e.target.value)} className={inputStil} placeholder="Npr. Ivan Horvat" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email adresa klijenta *</label>
                <input type="email" value={emailKorisnika} onChange={(e) => setEmailKorisnika(e.target.value)} className={inputStil} placeholder="klijent@email.com" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Početna lozinka za klijenta *</label>
                <input type="text" value={lozinkaKorisnika} onChange={(e) => setLozinkaKorisnika(e.target.value)} className={inputStil} placeholder="Minimalno 6 znakova" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={uTijeku} className="bg-blue-600 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-emerald-100 transition-all text-sm active:scale-[0.98] disabled:opacity-50">
              {uTijeku ? 'Kreiranje SaaS paketa...' : '🚀 Aktivaj novu tvrtku i cjenik'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
