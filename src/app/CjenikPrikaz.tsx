'use client';

import { useState, useEffect } from 'react'; // <--- Dodano ', useEffect'
import { Artikli, Grupe } from '@/types/database.types';
import ArtiklModal from './ArtiklModal';
import Link from 'next/link'; // <--- Ovdje uvozimo Link za navigaciju
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CubeIcon,         // <--- Dodajte ovaj uvoz
  Squares2X2Icon,   // <--- Dodajte ovaj uvoz
  CalendarDaysIcon  // <--- Dodajte ovaj uvoz
} from '@heroicons/react/24/outline';


interface CjenikPrikazProps {
  pocetniArtikli: Artikli[];
  grupe: Grupe[];
  firma: {
    naziv: string;
    adresa: string;
    oib: string;
  };
}
export default function CjenikPrikaz({ pocetniArtikli, grupe, firma }: CjenikPrikazProps) {
  const [odabranaGrupa, setOdabranaGrupa] = useState<number | 'sve'>('sve');
  const [pojamZaPretragu, setPojamZaPretragu] = useState('');
  // STANJA ZA PAGINACIJU (Stranice od po 10 artikala)
  const [trenutnaStranica, setTrenutnaStranica] = useState(1);
  const maxStavkiPoStranici = 10;
    // Stanje za praćenje otvorenog mobilnog mini-izbornika s tri točkice
  const [otvoreniMeniArtiklId, setOtvoreniMeniArtiklId] = useState<number | null>(null);

  // STANJA ZA MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'dodaj' | 'uredi' | 'obriši'>('dodaj');
  const [odabraniArtikl, setOdabraniArtikl] = useState<Artikli | null>(null);

  const otvoriModal = (mode: 'dodaj' | 'uredi' | 'obriši', artikl: Artikli | null = null) => {
    setModalMode(mode);
    setOdabraniArtikl(artikl);
    setIsModalOpen(true);
  };

  const filtriraniArtikli = pocetniArtikli.filter((artikl) => {
    const poklapaSeGrupa = odabranaGrupa === 'sve' || artikl.grupa_id === odabranaGrupa;
    const poklapaSeNaziv = artikl.naziv.toLowerCase().includes(pojamZaPretragu.toLowerCase());
    return poklapaSeGrupa && poklapaSeNaziv;
  });

   const ukupanBrojArtikala = filtriraniArtikli.length;

   // RAČUNANJE I REZANJE NIZA ARTIKALA ZA STRANICE
  const ukupnoStranica = Math.ceil(ukupanBrojArtikala / maxStavkiPoStranici);
  const indeksZadnjeg = trenutnaStranica * maxStavkiPoStranici;
  const indeksPrvog = indeksZadnjeg - maxStavkiPoStranici;
  
  // Ovaj niz sadrži točno i samo onih 10 artikala koji pripadaju trenutnoj stranici
  const paginiraniArtikli = filtriraniArtikli.slice(indeksPrvog, indeksZadnjeg);

  // Automatsko vraćanje na prvu stranicu čim korisnik krene pretraživati ili mijenjati grupu
  useEffect(() => {
    setTrenutnaStranica(1);
  }, [pojamZaPretragu, odabranaGrupa]);

  // LOGIKA: Pronalaženje stvarnog datuma zadnje promjene među svim artiklima (Bez TS grešaka)
  const dobijDatumZadnjePromjene = () => {
    // 1. Ako nema artikala, vrati današnji datum
    if (!pocetniArtikli || pocetniArtikli.length === 0) {
      return new Date().toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    let najnovijiTimestamp = 0;

    // 2. Prolazimo kroz sve artikle običnom, sigurnom petljom
    for (let i = 0; i < pocetniArtikli.length; i++) {
      const art = pocetniArtikli[i];
      if (art.datum_unosa) {
        const trenutniTimestamp = new Date(art.datum_unosa).getTime();
        if (trenutniTimestamp > najnovijiTimestamp) {
          najnovijiTimestamp = trenutniTimestamp;
        }
      }
    }

    // 3. Ako nismo pronašli niti jedan datum, vrati današnji
    if (najnovijiTimestamp === 0) {
      return new Date().toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // 4. Vrati formatirani najnoviji datum iz baze
    return new Date(najnovijiTimestamp).toLocaleDateString('hr-HR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const datumZadnjePromjenePrikaz = dobijDatumZadnjePromjene();

  return (
           <div className="space-y-6">
      {/* GLAVNI GUMB ZA NOVI ARTIKL - SADA DOMINIRA SAMOSTALNO KAO NA SLICI */}
      

      {/* 2. POSEBAN RED ZA GLAVNI GUMB: Točno kao na snimci zaslona */}
      <div className="flex justify-start items-center pt-2">
        <button
          onClick={() => otvoriModal('dodaj')}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-100 dark:shadow-none transition-all flex items-center gap-2 text-sm active:scale-[0.98]"
        >
          <PlusIcon className="w-5 h-5 text-white" />
          Novi artikl
        </button>
      </div>


         {/* SEKCIJA 1: Statističke kartice - VISINA SMANJENA ZA 20PX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        
        {/* Kartica 1: Ukupno artikala */}
        <div className="bg-white dark:bg-gray-900 px-6 py-3.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Ukupno artikala</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{ukupanBrojArtikala}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
            <CubeIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Kartica 2: Ukupno grupa */}
        <div className="bg-white dark:bg-gray-900 px-6 py-3.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Ukupno grupa</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{grupe.length}</h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400">
            <Squares2X2Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Kartica 3: Datum zadnje promjene */}
        <div className="bg-white dark:bg-gray-900 px-6 py-3.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Datum zadnje promjene</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{datumZadnjePromjenePrikaz}</h3>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-xl text-green-600 dark:text-green-400">
            <CalendarDaysIcon className="w-6 h-6" />
          </div>
        </div>

      </div>
      
      {/* SEKCIJA 2: Kontrole */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200/80 dark:border-gray-700/60 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="w-full md:flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Pretraži artikle po nazivu..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 font-medium"
            value={pojamZaPretragu}
            onChange={(e) => setPojamZaPretragu(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-72">
          <select
            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:dark:bg-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-medium transition-all"
            value={odabranaGrupa}
            onChange={(e) => setOdabranaGrupa(e.target.value === 'sve' ? 'sve' : Number(e.target.value))}
          >
            <option value="sve">📁 Sve grupe proizvoda</option>
            {grupe.map((grupa) => (
              <option key={grupa.id} value={grupa.id}>
                📄 {grupa.naziv}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SEKCIJA 3: Tablica s artiklima */}
      {filtriraniArtikli.length === 0 ? (
           <div className="bg-white dark:bg-gray-900 p-12 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200/80 dark:border-gray-700/60 text-center transition-colors">
          <p className="text-gray-400 dark:text-gray-500 text-lg font-medium">Nema artikala koji odgovaraju pretrazi.</p>
        </div>
      ) : (
       <div className="bg-white dark:bg-gray-900 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200/80 dark:border-gray-700/60 rounded-xl overflow-hidden transition-colors">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/70 dark:bg-gray-800/50 divide-y divide-gray-100 dark:divide-gray-800 select-none">
              <tr>
                {/* Smanjen px na px-2 za mobitele, na laptopu se vraća na sm:px-6 */}
                <th className="px-2 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Naziv artikla</th>
                
                <th className="px-6 py-4 hidden md:table-cell text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Naziv grupe</th>
                <th className="px-6 py-4 hidden md:table-cell text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Normativ</th>
                <th className="px-6 py-4 hidden md:table-cell text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Sidrena cijena</th>

                <th className="px-2 sm:px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Trenutna cijena</th>

                <th className="px-6 py-4 hidden md:table-cell text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-36">Datum primjene</th>

                {/* Promijenjeno u text-right i px-2 da tri točkice ulete unutar ekrana mobitela */}
                <th className="px-2 sm:px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {paginiraniArtikli.map((artikl) => (
                <tr key={artikl.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  
                  {/* 1. Ćelija: Naziv artikla */}
                  <td className="px-2 sm:px-6 py-4 whitespace-normal max-w-[120px] md:max-w-none text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 align-middle break-words">
                    {artikl.naziv}
                  </td>
                  
                  {/* 2. 3. i 4. Ćelija: Grupa, Normativ, Sidrena (Skriveno na mobitelu) */}
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 align-middle">{artikl.grupe?.naziv || 'Nije dodijeljena'}</td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center align-middle">{artikl.normativ || '-'}</td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400 align-middle font-medium">
                    {artikl.sidrena_cijena !== null && artikl.sidrena_cijena !== undefined ? `${Number(artikl.sidrena_cijena).toFixed(2)} €` : '-'}
                  </td>
                  
                  {/* 5. Ćelija: Trenutna cijena (Na mobitelu drži i mali datum unutar flexa, na laptopu je čist iznos) */}
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-right font-medium align-middle">
                    <div className="flex flex-col justify-center items-end min-h-[40px]">
                      <span className="text-[#224dab] dark:text-blue-400 font-bold text-sm sm:text-base">
                        {Number(artikl.cijena).toFixed(2)} €
                      </span>
                      {/* Na mobitelu dodajemo datum unutar iste ćelije radi uštede prostora */}
                      {artikl.datum_unosa && new Date(artikl.datum_unosa).getTime() > new Date('2026-10-01T23:59:59').getTime() && (
                        <span className="md:hidden text-[9px] text-gray-400 dark:text-gray-500 font-normal tracking-wide mt-0.5">
                          Primjena: {new Date(artikl.datum_unosa).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 6. Ćelija: ZASEBNI STUPAC ZA DATUM (Prikazuje se isključivo na laptopu / desktopu) */}
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400 align-middle">
                    {artikl.datum_unosa ? new Date(artikl.datum_unosa).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                  </td>

                  {/* 7. Ćelija: Stupac s akcijama i ugrađenim Kebab izbornikom (3 točkice) */}
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-middle relative">
                    
                     {/* RAČUNALNI PRIKAZ: Usklađeni gumbi sa stilom grupa proizvoda */}
                    <div className="hidden md:flex items-center justify-end gap-2 select-none">
                      {/* Gumb Uredi: Plavi stil s nježnom pozadinom i jasnim tekstom */}
                         <button
                        onClick={() => otvoriModal('uredi', artikl)}
                        className="p-2.5 bg-gray-50 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-blue-900/60 border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg shadow-sm hover:shadow-md hover:shadow-blue-200/60 dark:hover:shadow-blue-900/40 transition-all duration-200 active:scale-[0.97] text-base"
                        title="Uredi artikl"
                      >
                        ✏️
                      </button>

                      {/* Obriši gumb (🗑️) - POPRAVLJEN OBRUB: Dodan dark:border-gray-700 i pojačan crveni rub na hover */}
                      <button
                        onClick={() => otvoriModal('obriši', artikl)}
                        className="p-2.5 bg-gray-50 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/60 border border-gray-100 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 rounded-lg shadow-sm hover:shadow-md hover:shadow-red-200/60 dark:hover:shadow-red-900/40 transition-all duration-200 active:scale-[0.97] text-base"
                        title="Obriši artikl"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* MOBILNI PRIKAZ (3 točkice) */}
                    <div className="md:hidden inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOtvoreniMeniArtiklId(otvoreniMeniArtiklId === artikl.id ? null : artikl.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 font-bold text-xs transition-all active:scale-95"
                      >
                        •••
                      </button>

                     {/* Plutajući mini-prozorčić (Dropdown) sa stilom grupa proizvoda */}
                        {otvoreniMeniArtiklId === artikl.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOtvoreniMeniArtiklId(null)} />
                            
                            {/* Prostrana kućica izbornika s dodatnim unutarnjim razmakom p-2 */}
                            <div className="absolute right-2 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-20 p-2 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
                              
                              {/* Gumb Uredi: Plavi stil s nježnom pozadinom, idealan za dodir prsta */}
                              <button
                                onClick={() => {
                                  setOtvoreniMeniArtiklId(null);
                                  otvoriModal('uredi', artikl);
                                }}
                                className="w-full px-3.5 py-3 text-sm font-bold text-left rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all flex items-center gap-2.5 active:scale-[0.97]"
                              >
                                <span className="text-base">✏️</span>
                                <span>Uredi artikl</span>
                              </button>
                              
                              {/* Gumb Obriši: Crveni stil s blagim upozoravajućim tonovima */}
                              <button
                                onClick={() => {
                                  setOtvoreniMeniArtiklId(null);
                                  otvoriModal('obriši', artikl);
                                }}
                                className="w-full px-3.5 py-3 text-sm font-bold text-left rounded-xl bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all flex items-center gap-2.5 active:scale-[0.97]"
                              >
                                <span className="text-base">🗑️</span>
                                <span>Obriši artikl</span>
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
      )}

      {/* KONTROLNA TRAKA PAGINACIJE - ODMAH ISPOD BLOKA TABLICE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-sm select-none">
        
        {/* Statusni brojač stavki */}
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Prikazano <span className="font-bold text-gray-800 dark:text-gray-200">{ukupanBrojArtikala === 0 ? 0 : indeksPrvog + 1}</span> do{' '}
          <span className="font-bold text-gray-800 dark:text-gray-200">{indeksZadnjeg > ukupanBrojArtikala ? ukupanBrojArtikala : indeksZadnjeg}</span> od{' '}
          <span className="font-bold text-[#224dab] dark:text-blue-400">{ukupanBrojArtikala}</span> artikala
        </div>

        {/* Navigacijski gumbi */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTrenutnaStranica((p) => Math.max(p - 1, 1))}
            disabled={trenutnaStranica === 1}
            className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all active:scale-[0.97]"
          >
            ← Prethodna
          </button>
          
          <div className="text-xs font-bold text-gray-500 px-2 select-none">
            Stranica <span className="text-[#224dab] dark:text-blue-400">{trenutnaStranica}</span> od {ukupnoStranica || 1}
          </div>

          <button
            onClick={() => setTrenutnaStranica((p) => Math.min(p + 1, ukupnoStranica))}
            disabled={trenutnaStranica === ukupnoStranica || ukupnoStranica === 0}
            className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all active:scale-[0.97]"
          >
            Iduća →
          </button>
        </div>
      </div>

      <ArtiklModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        artikl={odabraniArtikl as any}
        grupe={grupe}
      />
    </div>
  );
}
