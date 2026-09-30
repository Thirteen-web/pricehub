import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Čitamo tvrtka_id iz URL parametra (npr. ?tvrtka_id=X)
    const { searchParams } = new URL(request.url);
    const urlTvrtkaId = searchParams.get('tvrtka_id');

    if (!urlTvrtkaId) {
      return NextResponse.json({ success: false, error: 'Nedostaje tvrtka_id parametar' }, { status: 400 });
    }

    const tvrtkaId = Number(urlTvrtkaId);

    // 2. Dohvaćanje artikala – IZOLIRANO samo za ovu tvrtku i sortirano
    const { data: artikli, error } = await supabase
      .from('artikli')
      .select('naziv, cijena, normativ, sidrena_cijena, grupa_id, datum_unosa, tvrtka_id')
      .eq('tvrtka_id', tvrtkaId) // Multi-tenant lokot!
      .order('naziv', { ascending: true });

    if (error) throw error;

    // 3. Definiramo zaglavlje tablice (Dodan stupac Tvrtka ID za potrebe budućeg uvoza i mapiranja)
    let csvSadrzaj = 'Naziv artikla;Grupa ID;Normativ;Sidrena cijena;Trenutna cijena;Datum primjene;Tvrtka ID\n';

    if (artikli) {
      artikli.forEach((art) => {
        const naziv = art.naziv ? art.naziv.replace(/;/g, ' ') : ''; // mičemo točka-zarez iz naziva da ne slomimo CSV
        const grupa = art.grupa_id || '-';
        const normativ = art.normativ || '-';
        const sidrena = art.sidrena_cijena ? Number(art.sidrena_cijena).toFixed(2) : '-';
        const trenutna = Number(art.cijena).toFixed(2);
        
        let datum = '-';
        if (art.datum_unosa) {
          datum = new Date(art.datum_unosa).toLocaleDateString('hr-HR');
        }

        // Dodajemo tvrtka_id na sam kraj svakog retka u CSV datoteci
        csvSadrzaj += `${naziv};${grupa};${normativ};${sidrena};${trenutna};${datum};${tvrtkaId}\n`;
      });
    }

    // Vraćamo CSV datoteku s ispravnim UTF-8 enkodingom i BOM oznakom za hrvatska slova
    const buffer = Buffer.from('\uFEFF' + csvSadrzaj, 'utf-8'); // Prisiljava Excel da odmah prepozna č,ć,š...

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=cjenik-kontrola-tvrtka-${tvrtkaId}.csv`,
        'Cache-Control': 'no-store, max-age=0'
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
