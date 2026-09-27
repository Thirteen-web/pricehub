import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    const { data: artikli, error } = await supabase
      .from('artikli')
      .select('naziv, cijena, normativ, sidrena_cijena, grupa_id, datum_unosa')
      .order('naziv', { ascending: true });

    if (error) throw error;

    // Definišemo zaglavlje tablice (koristimo točka-zarez ';' jer hrvatski Excel tako prepoznaje stupce)
    let csvSadrzaj = 'Naziv artikla;Grupa ID;Normativ;Sidrena cijena;Trenutna cijena;Datum primjene\n';

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

        csvSadrzaj += `${naziv};${grupa};${normativ};${sidrena};${trenutna};${datum}\n`;
      });
    }

    // Vraćamo CSV datoteku s ispravnim UTF-8 enkodingom za hrvatska slova
    const buffer = Buffer.from('\uFEFF' + csvSadrzaj, 'utf-8'); // \uFEFF je BOM oznaka koja prisiljava Excel da odmah prepozna č,ć,š...

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=cjenik-kontrola.csv',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
