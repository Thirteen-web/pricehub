import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Čitamo tvrtka_id iz URL parametra
    const { searchParams } = new URL(request.url);
    const urlTvrtkaId = searchParams.get('tvrtka_id');

    if (!urlTvrtkaId) {
      return new NextResponse('<h3>Greška: Nedostaje tvrtka_id parametar</h3>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 400
      });
    }

    const tvrtkaId = Number(urlTvrtkaId);

    // 2. Dohvaćanje artikala s multi-tenant lokotom
    const { data: artikli } = await supabase
      .from('artikli')
      .select('*, grupe(naziv)')
      .eq('tvrtka_id', tvrtkaId)
      .order('grupa_id', { ascending: true })
      .order('naziv', { ascending: true });

    // 3. Dohvaćanje podataka o tvrtki za memorandum
    const { data: tvrtkaPodaci } = await supabase
      .from('tvrtke')
      .select('naziv, adresa, oib')
      .eq('id', tvrtkaId)
      .single();

    const fNaziv = tvrtkaPodaci?.naziv || 'Naziv tvrtke d.o.o.';
    const fAdresa = tvrtkaPodaci?.adresa || 'Ulica i kućni broj, Grad';
    const fOib = tvrtkaPodaci?.oib || '00000000000';

    // 4. Generiranje redova tablice iz podataka iz baze
    const redoviTabliceHtml = (artikli || []).map((art: any) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 10px; font-weight: 500; color: #1a202c;">${art.naziv}</td>
        <td style="padding: 12px 10px; color: #4a5568;">${art.grupe?.naziv || 'Ostalo'}</td>
        <td style="padding: 12px 10px; text-align: center; color: #4a5568;">${art.normativ || '-'}</td>
        <td style="padding: 12px 10px; text-align: right; font-weight: 700; color: #224dab;">${Number(art.cijena).toFixed(2)} €</td>
      </tr>
    `).join('');

    // 5. Izrada kompletnog vizualnog A4 dokumenta (Hrvatska slova rade 100% automatski!)
    const htmlSadrzaj = `
      <!DOCTYPE html>
      <html lang="hr">
        <head>
          <title>Cjenik - ${fNaziv}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              padding: 50px; 
              color: #1a202c; 
              line-height: 1.5; 
              max-width: 800px;
              margin: 0 auto;
            }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #224dab; padding-bottom: 20px; margin-bottom: 35px; }
            .firma-info { font-size: 13px; color: #4a5568; line-height: 1.6; font-weight: 500; }
            .firma-naziv { font-size: 15px; font-weight: 700; color: #1a202c; margin-bottom: 2px; text-transform: uppercase; }
            .naslov-info { text-align: right; }
            .naslov { font-size: 24px; font-weight: 800; color: #224dab; margin: 0; letter-spacing: -0.5px; }
            .datum { font-size: 12px; color: #718096; margin-top: 6px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 14px; }
            th { background-color: #f8fafc; color: #224dab; font-weight: 700; text-align: left; padding: 14px 10px; border-bottom: 2px solid #cbd5e0; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
            .napomena { font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 20px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="firma-info">
              <div class="firma-naziv">${fNaziv}</div>
              ${fAdresa}<br>
              <strong>OIB:</strong> ${fOib}
            </div>
            <div class="naslov-info">
              <div class="naslov">CJENIK PROIZVODA</div>
              <div class="datum">Datum ispisa: ${new Date().toLocaleDateString('hr-HR')}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Naziv artikla</th>
                <th>Grupa proizvoda</th>
                <th style="text-align: center;">Normativ</th>
                <th style="text-align: right;">Cijena</th>
              </tr>
            </thead>
            <tbody>
              ${redoviTabliceHtml}
            </tbody>
          </table>
          <div class="napomena">Cijene su iskazane u eurima s uključenim porezom.</div>
          
          <script>
            // ČAROBNA LINIJA: Automatski pokreće PDF manager preglednika u novom tabu!
            window.onload = function() {
              window.print();
            };
          </script>

        </body>
      </html>
    `;

    // 6. KLJUČNI KORAK: Vraćamo čist HTML umjesto JSON-a!
    return new NextResponse(htmlSadrzaj, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      },
      status: 200
    });

  } catch (error: any) {
    console.error('Greška unutar API rute za PDF:', error);
    return new NextResponse(`<h3>Serverska greška: ${error.message}</h3>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 500
    });
  }
}
