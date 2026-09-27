'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { 
  DocumentTextIcon, 
  FolderIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

// OVA LINIJA JE BILA POKVARENA/IZBRISANA – SADA JE ISPRAVLJENA:
export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
 const [generiramPdf, setGeneriramPdf] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pokreniGeneriranjePdfa = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (generiramPdf) return;
    setGeneriramPdf(true);

    try {
          // 1. Dohvaćanje čistih podataka iz API rute
      const odgovor = await fetch('/api/export-pdf');
      const podaci = await odgovor.json();

      // PRONAĐI NAJNOVIJI DATUM PROMJENE MEĐU ARTIKLIMA
      let zadnjaPromjenaDatum = new Date();
      if (podaci.artikli && podaci.artikli.length > 0) {
        const datumi = podaci.artikli
          .map((a: any) => a.datum_unosa ? new Date(a.datum_unosa).getTime() : 0)
          .filter((t: number) => t > 0);
        if (datumi.length > 0) {
          zadnjaPromjenaDatum = new Date(Math.max(...datumi));
        }
      }
      
      const prikazniDatumZadnjePromjene = zadnjaPromjenaDatum.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const fNaziv = podaci.postavke?.find((p: any) => p.kljuc === 'firma_naziv')?.vrijednost || 'Naziv tvrtke d.o.o.';
      const fAdresa = podaci.postavke?.find((p: any) => p.kljuc === 'firma_adresa')?.vrijednost || 'Ulica i kućni broj, Grad';
      const fOibBrojCist = podaci.postavke?.find((p: any) => p.kljuc === 'firma_oib')?.vrijednost || '00000000000';
      const zakonskaCista = podaci.postavke?.find((p: any) => p.kljuc === 'zakonska_napomena')?.vrijednost || '';

      // 2. Dinamički uvozimo pdfmake unutar preglednika
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;

      // Pretvaramo u 'any' kako bismo trajno ugasili podvlačenje crvene linije na vfs i fonts svojstvima
      const printerInstance = pdfMake as any;

      // Povezivanje virtualnog sustava datoteka (vfs)
      if (pdfFonts && (pdfFonts as any).pdfMake?.vfs) {
        printerInstance.vfs = (pdfFonts as any).pdfMake.vfs;
      } else if (pdfFonts && (pdfFonts as any).vfs) {
        printerInstance.vfs = (pdfFonts as any).vfs;
      } else {
        printerInstance.vfs = (pdfFonts as any);
      }

      // Definiranje Roboto fonta s ugrađenom UTF-8 unicode podrškom
      printerInstance.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italic: 'Roboto-Italic.ttf',
          bolditalic: 'Roboto-MediumItalic.ttf'
        }
      };

        // 3. Priprema redova za tablicu (Službena plava boja teksta #2563eb na srebrnoj pozadini #c0c0c0)
      const tableRows = [
        [
          { text: 'Naziv artikla', bold: true, color: '#224dab', fillColor: '#e1e1e1' },
          { text: 'Grupa proizvoda', bold: true, color: '#224dab', fillColor: '#e1e1e1' },
          { text: 'Normativ', bold: true, color: '#224dab', fillColor: '#e1e1e1', alignment: 'center' },
          { text: 'Cijena 10.09.26.', bold: true, color: '#224dab', fillColor: '#e1e1e1', alignment: 'right' },
          { text: 'Trenutna cijena', bold: true, color: '#224dab', fillColor: '#e1e1e1', alignment: 'right' }
        ]
      ];

      // Punjenje tablice podacima uz strogu provjeru: samo datumi nakon 01.10.2026. dobivaju natpis
      (podaci.artikli || []).forEach((art: any) => {
        // Priprema datuma artikla za usporedbu
        const datumArtikla = art.datum_unosa ? new Date(art.datum_unosa) : null;
        
        // POSTAVLJAMO GRANICU NA KRAJ DANA 01.10.2026. (23 sata, 59 minuta, 59 sekundi)
        const granicaUsporedbe = new Date('2026-10-01T23:59:59');
        const formatiraniDatum = datumArtikla ? datumArtikla.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

        // UVJET: Datum unosa mora biti strogo veći od kraja dana 01.10.2026.
        // Artikli uneseni 01.10.2026. i prije garantirano NEĆE imati datum ispod cijene!
        const jeNoviDatum = datumArtikla && datumArtikla.getTime() > granicaUsporedbe.getTime();

   // Konstrukcija pete ćelije (Trenutna cijena - USKLAĐENA BOJA TEKSTA NA KRALJEVSKO PLAVU #224dab)
        const trenutnaCijenaCelija: any = {
          text: [
            { text: `${Number(art.cijena).toFixed(2)} €\n`, bold: true, color: '#224dab', fontSize: 9 }
          ],
          alignment: 'right'
        };

        // Ako je uvjet ispunjen (artikl modificiran od 02.10.2026. nadalje), ispisujemo datum primjene
        if (jeNoviDatum) {
          trenutnaCijenaCelija.text.push({
            text: `od: ${formatiraniDatum}`,
            bold: false,
            color: '#1a202c',
            fontSize: 7.5
          });
        }

        tableRows.push([
          { text: art.naziv, bold: false, color: '#1a202c', fillColor: '' },
          { text: art.grupe?.naziv || 'Nije dodijeljena', bold: false, color: '#1a202c', fillColor: '' },
          { text: art.normativ || '-', bold: false, color: '#1a202c', fillColor: '', alignment: 'center' },
          { text: art.sidrena_cijena !== null && art.sidrena_cijena !== undefined ? `${Number(art.sidrena_cijena).toFixed(2)} €` : '-', bold: false, color: '#1a202c', fillColor: '', alignment: 'right' },
          trenutnaCijenaCelija
        ]);
      });
      
      const danasnjiDatum = new Date().toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      // 4. Definicija strukture cijelog PDF dokumenta
      const docDefinition: any = {
        content: [
          // Gornji dio: Memorandum i Naziv cjenika
          {
            columns: [
              {
                text: `${fNaziv.toUpperCase()}\n${fAdresa}\nOIB: ${fOibBrojCist}`,
                fontSize: 9,
                color: '#646464',
                lineHeight: 1.3
              },
                 {
              // Usklađena boja naslova u duboku kraljevsko plavu #224dab kako bi se savršeno slagala s tablicom
              text: [
                { text: 'CJENIK PROIZVODA\n', fontSize: 16, bold: true, color: '#224dab' },
                { text: `Zadnja promjena: ${prikazniDatumZadnjePromjene}.g`, fontSize: 8, bold: false, color: '#646464' }
              ],
              alignment: 'right',
              lineHeight: 1.3
            }
            ],
            margin: [0, 0, 0, 20] // Fiksna tekstualna margina ispod memoranduma
          },
          // Elegantna horizontalna crta razdvajanja
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e2e8f0' }],
            margin: [0, 0, 0, 20]
          },
          // Glavna tablica s artiklima
          {
            table: {
            headerRows: 1,
            // Proširena oba stupca cijena kako bi idealno zatvorili A4 format
            widths: ['32%', '20%', '12%', '19%', '17%'],
            body: tableRows
          },
            layout: {
              // GLOBALNI VERTIKALNI PADDING KOJI VRAĆA TEKST U APSOLUTNI CENTAR
              paddingLeft: () => 6,
              paddingRight: () => 6,
              paddingTop: () => 10,    // <--- Dodajte ovo (odmak od gornjeg ruba)
              paddingBottom: () => 10, // <--- Dodajte ovo (odmak od donjeg ruba)
              fillColor: function (rowIndex: number) {
                if (rowIndex === 0) return null;
                return (rowIndex % 2 === 0) ? '#f8fafc' : null;
              },
              hLineColor: () => '#cbd5e1',
              vLineColor: () => '#cbd5e1',
              hLineWidth: () => 0.3,
              vLineWidth: () => 0.3
            }
          }
        ],
      
         // ZAKONSKA NAPOMENA + DINAMIČKI BROJEVI STRANICA FIKSIRANI NA DNU SVAKE STRANICE
        footer: function (currentPage: number, pageCount: number) {
          return {
            stack: [
              // Horizontalna linija tik iznad footera
              { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: '#e2e8f0' }] },
              {
                columns: [
                  // Lijeva strana footera: Zakonska napomena
                  { text: zakonskaCista, fontSize: 8, color: '#7c7c7c', alignment: 'left', width: '75%' },
                  // Desna strana footera: Dinamički brojevi stranica
                  { text: `Stranica ${currentPage} od ${pageCount}`, fontSize: 8, color: '#7c7c7c', alignment: 'right', width: '25%' }
                ],
                margin: [40, 6, 40, 0] // Fiksne margine: [lijevo, gore, desno, dolje] ugrađene kao čisti brojevi
              }
            ],
            margin: [0, 0, 0, 10]
          };
        },

        defaultStyle: {
          font: 'Roboto', // Aktivacija fonta s punom UTF-8 podrškom
          fontSize: 9
        },
        pageMargins: [40, 40, 40, 60] // Gornja, lijeva, desna i donja margina stranice
      };

      // 5. Otvaranje čistog PDF-a u novom tabu preglednika
      pdfMake.createPdf(docDefinition).open();

    } catch (gError) {
      console.error('Greška pri klijentskom generiranju PDF-a:', gError);
    } finally {
      setGeneriramPdf(false);
    }
  };


  if (pathname === '/login') return null;

  const dobiStilGumba = (ruta: string) => {
    const jeAktivna = pathname === ruta;
    const bazniStil = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group w-full text-left";
    
    if (jeAktivna) {
      return `${bazniStil} bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/30`;
    }
    return `${bazniStil} text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100`;
  };

  const dobiStilIkone = (ruta: string) => {
    return pathname === ruta 
      ? "w-5 h-5 text-blue-600 dark:text-blue-400" 
      : "w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors";
  };

  return (
    <div className="h-full flex flex-col p-4 mt-2 pb-12 select-none">
      {/* NAVIGACIJSKI LINKOVI */}
      <nav className="flex-1 space-y-2">
        <Link href="/" className={dobiStilGumba('/')}>
          <DocumentTextIcon className={dobiStilIkone('/')} />
          Digitalni cjenik
        </Link>

        <Link href="/grupe" className={dobiStilGumba('/grupe')}>
          <FolderIcon className={dobiStilIkone('/grupe')} />
          Grupe proizvoda
        </Link>

        <Link href="/postavke" className={dobiStilGumba('/postavke')}>
          <Cog6ToothIcon className={dobiStilIkone('/postavke')} />
          Opcije sustava
        </Link>

        {/* Sekcija: Izvještaji */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Izvještaji</p>
          
          <button 
            onClick={pokreniGeneriranjePdfa}
            disabled={generiramPdf}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 group w-full text-left disabled:opacity-50"
          >
            <PrinterIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            {generiramPdf ? 'Priprema PDF-a...' : 'Ispis cjenika (PDF)'}
          </button>

          <a href="/api/export-csv" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 group">
            <DocumentArrowDownIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            Financijski CSV (Excel)
          </a>

          <a href="/api/export-xml" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 group">
            <DocumentArrowDownIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            Kontrolni XML file
          </a>
        </div>
      </nav>

      {/* Donji dio: Tema i Odjava */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 w-full text-left group"
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="w-5 h-5 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
                <span>Svijetli način</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5 text-blue-500 transition-transform duration-300 group-hover:-rotate-12" />
                <span>Tamni način</span>
              </>
            )}
          </button>
        )}

        <button 
          onClick={async () => {
            const { supabase } = await import('@/utils/supabase');
            await supabase.auth.signOut();
            document.cookie = "cjenik-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-red-50/60 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 active:scale-[0.98] w-full text-left group"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          Odjava iz sustava
        </button>
      </div>
    </div>
  );
}
