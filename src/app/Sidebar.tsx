'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { 
  DocumentTextIcon, 
  FolderIcon,
  PrinterIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ onAction }: { onAction?: () => void }) {
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

      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      const printerInstance = pdfMake as any;

      if (pdfFonts && (pdfFonts as any).pdfMake?.vfs) {
        printerInstance.vfs = (pdfFonts as any).pdfMake.vfs;
      } else if (pdfFonts && (pdfFonts as any).vfs) {
        printerInstance.vfs = (pdfFonts as any).vfs;
      } else {
        printerInstance.vfs = (pdfFonts as any);
      }

      printerInstance.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italic: 'Roboto-Italic.ttf',
          bolditalic: 'Roboto-MediumItalic.ttf'
        }
      };

      const tableRows = [
        [
          { text: 'Naziv artikla', bold: true, color: '#224dab', fillColor: '#e1e1e1' },
          { text: 'Grupa proizvoda', bold: true, color: '#224dab', fillColor: '#e1e1e1' },
          { text: 'Normativ', bold: true, color: '#224dab', fillColor: '#e1e1e1', alignment: 'center' },
          { text: 'Cijena 10.09.26.', bold: true, color: '#224dab', fillColor: '#e1e1e1', alignment: 'right' },
          { text: 'Trenutna cijena', bold: true, color: '#224dab', fillColor: '#e1e1e1', alignment: 'right' }
        ]
      ];

      (podaci.artikli || []).forEach((art: any) => {
        const datumArtikla = art.datum_unosa ? new Date(art.datum_unosa) : null;
        const granicaUsporedbe = new Date('2026-10-01T23:59:59');
        const formatiraniDatum = datumArtikla ? datumArtikla.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
        const jeNoviDatum = datumArtikla && datumArtikla.getTime() > granicaUsporedbe.getTime();

        const trenutnaCijenaCelija: any = {
          text: [
            { text: `${Number(art.cijena).toFixed(2)} €\n`, bold: true, color: '#224dab', fontSize: 9 }
          ],
          alignment: 'right'
        };

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
      
      const docDefinition: any = {
        content: [
          {
            columns: [
              { text: `${fNaziv.toUpperCase()}\n${fAdresa}\nOIB: ${fOibBrojCist}`, fontSize: 9, color: '#646464', lineHeight: 1.3 },
              {
                text: [
                  { text: 'CJENIK PROIZVODA\n', fontSize: 16, bold: true, color: '#224dab' },
                  { text: `Zadnja promjena: ${prikazniDatumZadnjePromjene}.g`, fontSize: 8, bold: false, color: '#646464' }
                ],
                alignment: 'right',
                lineHeight: 1.3
              }
            ],
            margin: [0, 0, 0, 20]
          },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e2e8f0' }], margin: [0, 0, 0, 20] },
          {
            table: {
              headerRows: 1,
              widths: ['32%', '20%', '12%', '19%', '17%'],
              body: tableRows
            },
            layout: {
              paddingLeft: () => 6,
              paddingRight: () => 6,
              paddingTop: () => 10,
              paddingBottom: () => 10,
              fillColor: (rowIndex: number) => (rowIndex !== 0 && rowIndex % 2 === 0) ? '#f8fafc' : null,
              hLineColor: () => '#cbd5e1',
              vLineColor: () => '#cbd5e1',
              hLineWidth: () => 0.3,
              vLineWidth: () => 0.3
            }
          },
          { text: zakonskaCista, fontSize: 8, color: '#646464', margin:[0, 20, 0, 0], lineHeight: 1.4 }
        ],
        pageMargins: [40, 40, 40, 40]
      };

      printerInstance.createPdf(docDefinition).open();
    } catch (err) {
      console.error('Greška pri generiranju PDF-a:', err);
    } finally {
      setGeneriramPdf(false);
    }
  };

     const dobiStilGumba = (ruta: string) => {
    const aktivan = pathname === ruta;
    return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all select-none ${
      aktivan 
        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 font-semibold'
    }`;
  };

  if (!mounted) return null;

   return (
    <div className="h-full flex flex-col justify-between p-4 pt-14 pb-8 select-none">
      
      {/* 1. GLAVNA NAVIGACIJA + GUMBI ZA IZVOZ/ISPIS */}
      <nav className="flex-1 space-y-2">
        <Link href="/" onClick={onAction} className={dobiStilGumba('/')}>
          <DocumentTextIcon className="w-5 h-5" />
          <span>Digitalni cjenik</span>
        </Link>

        <Link href="/grupe" onClick={onAction} className={dobiStilGumba('/grupe')}>
          <FolderIcon className="w-5 h-5" />
          <span>Grupe proizvoda</span>
        </Link>

        <Link href="/postavke" onClick={onAction} className={dobiStilGumba('/postavke')}>
          <Cog6ToothIcon className="w-5 h-5" />
          <span>Postavke sustava</span>
        </Link>

        {/* --- RAZDJELNIK --- */}
        <div className="my-4 border-t border-gray-100 dark:border-gray-800/60 pt-2" />

        {/* PDF Gumb */}
        <button 
          onClick={(e) => { if (onAction) onAction(); pokreniGeneriranjePdfa(e); }}
          disabled={generiramPdf}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all group w-full text-left disabled:opacity-50"
        >
          <PrinterIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <span>{generiramPdf ? 'Priprema PDF-a...' : 'Ispis cjenika (PDF)'}</span>
        </button>

        {/* CSV Gumb */}
        <Link 
          href="/api/export-csv"
          onClick={onAction}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all group w-full text-left"
        >
          <PrinterIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <span>Izvoz podataka (CSV)</span>
        </Link>

        {/* XML Gumb */}
        <Link 
          href="/export-xml"
          onClick={onAction}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all group w-full text-left"
        >
          <PrinterIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <span>Izvoz cjenika (XML)</span>
        </Link>
      </nav>

      {/* 2. SPUŠTENI DIO: UPRAVLJANJE APLIKACIJOM (Tema i Odjava) */}
      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* Prebacivanje teme */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-all w-full text-left"
        >
          {theme === 'dark' ? (
            <><SunIcon className="w-5 h-5 text-amber-500" /><span>Svijetli način</span></>
          ) : (
            <><MoonIcon className="w-5 h-5 text-blue-600" /><span>Tamni način</span></>
          )}
        </button>

        {/* Gumb za odjavu */}
          {/* Gumb za odjavu - SADA DISKRETAN I UGODAN ZA OKO */}
        <button
          onClick={async () => {
            const { supabase } = await import('@/utils/supabase');
            await supabase.auth.signOut();
            document.cookie = 'cjenik-session=; Max-Age=0; path=/;';
            if (onAction) onAction();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/20 transition-all w-full text-left mt-2 select-none group"
        >
          {/* Ikona je u startu siva, a na hover postaje crvena prateći tekst */}
          <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500 dark:text-gray-500 dark:group-hover:text-red-400" />
          <span>Odjava iz sustava</span>
        </button>
      </div>

    </div>
  );
}

