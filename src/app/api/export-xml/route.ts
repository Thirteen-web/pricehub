import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    // 1. Dohvaćamo sve artikle s povezanim nazivom grupe, sortirano po grupama pa abecedno
    const { data: artikli, error } = await supabase
      .from('artikli')
      .select('*, grupe(naziv)')
      .order('grupa_id', { ascending: true })
      .order('naziv', { ascending: true });

    if (error) throw error;

    // 2. Početak izgradnje čistog XML stringa
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<cjenik_izvoz generirano="${new Date().toISOString()}">\n`;
    xml += `  <artikli>\n`;

    // 3. Prolazak kroz artikle i punjenje XML čvorova
    (artikli || []).forEach((art: any) => {
      const nazivGrupe = art.grupe?.naziv || 'Nije dodijeljena';
      const normativ = art.normativ || '-';
      const sidrenaCijena = art.sidrena_cijena !== null && art.sidrena_cijena !== undefined ? Number(art.sidrena_cijena).toFixed(2) : '-';
      const trenutnaCijena = Number(art.cijena).toFixed(2);
      const datumUnosa = art.datum_unosa ? new Date(art.datum_unosa).toISOString().substring(0, 10) : '-';

      xml += `    <artikl id="${art.id}">\n`;
      xml += `      <naziv>${escapeXml(art.naziv)}</naziv>\n`;
      xml += `      <grupa>${escapeXml(nazivGrupe)}</grupa>\n`;
      xml += `      <normativ>${escapeXml(normativ)}</normativ>\n`;
      xml += `      <sidrena_cijena>${sidrenaCijena} €</sidrena_cijena>\n`;
      xml += `      <trenutna_cijena>${trenutnaCijena} €</trenutna_cijena>\n`;
      xml += `      <datum_primjene>${datumUnosa}</datum_primjene>\n`;
      xml += `    </artikl>\n`;
    });

    xml += `  </artikli>\n`;
    xml += `</cjenik_izvoz>`;

    // 4. Vraćamo XML odgovor s točnim Content-Type zaglavljem kako bi ga preglednik prepoznao
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': 'inline; filename="cjenik_izvoz.xml"',
      },
    });

  } catch (error: any) {
    console.error('Greška prilikom XML izvoza:', error);
    return NextResponse.json({ error: 'Neuspješno generiranje XML-a' }, { status: 500 });
  }
}

// Pomoćna funkcija koja čisti specijalne znakove (poput &, <, >) da XML ne bi javio grešku strukture
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
