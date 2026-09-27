import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

export async function GET(request: NextRequest) {
  try {
    // 1. Dohvaćanje postavki iz baze podataka
    const { data: postavke } = await supabase
      .from('postavke')
      .select('kljuc, vrijednost');

    const fNaziv = postavke?.find(p => p.kljuc === 'firma_naziv')?.vrijednost || 'Naziv tvrtke d.o.o.';
    const fAdresa = postavke?.find(p => p.kljuc === 'firma_adresa')?.vrijednost || 'Ulica i kućni broj, Grad';
    const fOibBrojCist = postavke?.find(p => p.kljuc === 'firma_oib')?.vrijednost || '00000000000';
    const zakonskaCista = postavke?.find(p => p.kljuc === 'zakonska_napomena')?.vrijednost || '';

    // 2. Dohvaćanje artikala
    const { data: artikli, error: artError } = await supabase
      .from('artikli')
      .select('*, grupe(naziv)')
      .order('naziv', { ascending: true });

    if (artError) throw artError;

    // 3. Inicijalizacija jsPDF dokumenta
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Koristimo ugrađenu helveticu (Arial alternativa)
    const fNazivFonta = 'helvetica';
    doc.setFont(fNazivFonta, 'normal');

    // ==========================================
    // MEMORANDUM I DIZAJN GLAVE PDF-a (Čisti Arial stil)
    // ==========================================
    doc.setFontSize(11);
    doc.setTextColor('#1a202c'); 
    doc.text(fNaziv.toUpperCase(), 14, 15);
    
    doc.setFontSize(9);
    doc.setTextColor('#646464'); 
    doc.text(fAdresa, 14, 21);
    doc.text(`OIB: ${fOibBrojCist}`, 14, 26);

    // Desna strana: Naziv i datum dokumenta
    doc.setFontSize(14);
    doc.setTextColor('#2563eb'); 
    doc.text('CJENIK PROIZVODA', 196, 15, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setTextColor('#646464');
    const danasnjiDatum = new Date().toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    doc.text(`Datum ispisa: ${danasnjiDatum}.g`, 196, 21, { align: 'right' });

    // Horizontalna linija razdvajanja
    doc.setDrawColor('#e2e8f0');
    doc.setLineWidth(0.3);
    doc.line(14, 30, 196, 30);

    // ==========================================
    // PRIPREMA PODATAKA ZA TABLICU
    // ==========================================
    const tableBody = (artikli || []).map((art) => [
      art.naziv,
      art.grupe?.naziv || 'Nije dodijeljena',
      art.normativ || '-',
      art.sidrena_cijena !== null && art.sidrena_cijena !== undefined ? `${Number(art.sidrena_cijena).toFixed(2)} EUR` : '-',
      `${Number(art.cijena).toFixed(2)} EUR`,
      art.datum_unosa ? new Date(art.datum_unosa).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
    ]);

    // 4. Izrada ulaštene tablice s autotable
    autoTable(doc, {
      startY: 36,
      head: [['Naziv artikla', 'Grupa proizvoda', 'Normativ', 'Cijena 10.09.26.', 'Trenutna cijena', 'Datum primjene']],
      body: tableBody,
      theme: 'striped',
      styles: {
        font: fNazivFonta, // helvetica (Arial)
        fontSize: 9,
        cellPadding: 4,
        textColor: '#1a202c', 
        lineColor: '#cbd5e1', 
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: '#1e293b', 
        textColor: '#ffffff', 
        fontSize: 9,
        halign: 'left',
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: '#f8fafc' 
      },
      columnStyles: {
        0: { cellWidth: 55 }, 
        1: { cellWidth: 35 }, 
        2: { cellWidth: 22, halign: 'center' }, 
        3: { cellWidth: 30, halign: 'right' }, 
        4: { cellWidth: 26, halign: 'right' }, 
        5: { cellWidth: 26, halign: 'center' } 
      },
      didDrawPage: function (data: any) {
        // ==========================================
        // ISPIS ZAKONSKE NAPOMENE NA SAMOM DNU PAPIRA
        // ==========================================
        if (zakonskaCista) {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height;
          
          doc.setFontSize(8);
          doc.setTextColor('#646464');
          
          const splitLines = doc.splitTextToSize(zakonskaCista, 182);
          let yPozicija = pageHeight - (splitLines.length * 4) - 15;
          
          doc.setDrawColor('#e2e8f0');
          doc.line(14, yPozicija - 4, 196, yPozicija - 4);
          
          for (let i = 0; i < splitLines.length; i++) {
            doc.text(splitLines[i], 14, yPozicija);
            yPozicija += 4;
          }
        }
      }
    });

    // 5. Slanje u preglednik
    const pdfBuffer = doc.output('arraybuffer');
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=cjenik-proizvoda.pdf'
      }
    });

  } catch (error: any) {
    console.error('Greška pri generiranju PDF-a:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
