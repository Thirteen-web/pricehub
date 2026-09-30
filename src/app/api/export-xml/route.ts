import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Čitamo tvrtka_id iz URL parametra (npr. ?tvrtka_id=X)
    const { searchParams } = new URL(request.url);
    const urlTvrtkaId = searchParams.get('tvrtka_id');

    if (!urlTvrtkaId) {
      return NextResponse.json({ error: 'Nedostaje tvrtka_id parametar' }, { status: 400 });
    }

    const tvrtkaId = Number(urlTvrtkaId);

    // 2. Dohvaćanje artikala s multi-tenant lokotom
    const { data: artikli, error } = await supabase
      .from('artikli')
      .select('*, grupe(naziv)')
      .eq('tvrtka_id', tvrtkaId) // Multi-tenant lokot!
      .order('grupa_id', { ascending: true })
      .order('naziv', { ascending: true });

    if (error) throw error;

    // 3. Početak izgradnje čistog XML stringa
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<cjenik_izvoz generirano="${new Date().toISOString()}" tvrtka_id="${tvrtkaId}">\n`;
    xml += `  <artikli>\n`;

    // 4. Prolazak kroz artikle i punjenje XML čvorova
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
      xml += `      <tvrtka_id>${tvrtkaId}</tvrtka_id>\n`; // Dodan čvor radi lakšeg mapiranja i uvoza
      xml += `    </artikl>\n`;
    });

    xml += `  </artikli>\n`;
    xml += `</cjenik_izvoz>`;

    // 5. Vraćamo XML odgovor s privitkom za automatsko preuzimanje i izbjegavanje sirovog teksta
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="cjenik_izvoz_tvrtka_${tvrtkaId}.xml"`,
        'Cache-Control': 'no-store, max-age=0'
      },
    });

  } catch (error: any) {
    console.error('Greška prilikom XML izvoza:', error);
    return NextResponse.json({ error: 'Neuspješno generiranje XML-a' }, { status: 500 });
  }
}

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
