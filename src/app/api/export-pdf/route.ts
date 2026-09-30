import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlTvrtkaId = searchParams.get('tvrtka_id');

    if (!urlTvrtkaId) {
      return new NextResponse('<h3>Greška: Nedostaje tvrtka_id parametar</h3>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 400
      });
    }

    const tvrtkaId = Number(urlTvrtkaId);

    const { data: artikli, error: artError } = await supabase
      .from('artikli')
      .select('*, grupe(naziv)')
      .eq('tvrtka_id', tvrtkaId)
      .order('grupa_id', { ascending: true })
      .order('naziv', { ascending: true });

    if (artError) throw artError;

    const { data: tvrtkaPodaci } = await supabase
      .from('tvrtke')
      .select('naziv, adresa, oib')
      .eq('id', tvrtkaId)
      .single();

    const fNaziv = tvrtkaPodaci?.naziv || 'Naziv tvrtke d.o.o.';
    const fAdresa = tvrtkaPodaci?.adresa || 'Ulica i kućni broj, Grad';
    const fOib = tvrtkaPodaci?.oib || '00000000000';

    // GENERIRANJE REDOVA S FILTRIRANIM PRIKAZOM DATUMA NAKON 02.10.2026.
    const redoviTabliceHtml = (artikli || []).map((art: any) => {
      const sidrenaCijenaPrikaz = art.sidrena_cijena !== null && art.sidrena_cijena !== undefined 
        ? `${Number(art.sidrena_cijena).toFixed(2)} €` 
        : '-';

      let datumIspodCijeneHtml = '';
      
      if (art.datum_unosa) {
        const datumArtikla = new Date(art.datum_unosa);
        // STROGI ZAKONSKI PRAG: Samo datumi veći od 02.10.2026. u 23:59:59
        const granicaUsporedbe = new Date('2026-10-02T23:59:59');
        
        if (datumArtikla.getTime() > granicaUsporedbe.getTime()) {
          const formatiraniDatum = datumArtikla.toLocaleDateString('hr-HR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          datumIspodCijeneHtml = `<div style="font-size: 11px; color: #718096; font-weight: 400; margin-top: 2px;">od: ${formatiraniDatum}</div>`;
        }
      }

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 10px; font-weight: 500; color: #1a202c;">${art.naziv}</td>
          <td style="padding: 12px 10px; color: #4a5568;">${art.grupe?.naziv || 'Ostalo'}</td>
          <td style="padding: 12px 10px; text-align: center; color: #4a5568;">${art.normativ || '-'}</td>
          <td style="padding: 12px 10px; text-align: right; color: #4a5568; font-weight: 500;">${sidrenaCijenaPrikaz}</td>
          <td style="padding: 12px 10px; text-align: right; font-weight: 700; color: #224dab;">
            <div>${Number(art.cijena).toFixed(2)} €</div>
            ${datumIspodCijeneHtml}
          </td>
        </tr>
      `;
    }).join('');

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
              max-width: 850px;
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
                <th style="width: 32%;">Naziv artikla</th>
                <th style="width: 23%;">Grupa proizvoda</th>
                <th style="width: 13%; text-align: center;">Normativ</th>
                <th style="width: 17%; text-align: right;">Cijena 10.09.26.</th>
                <th style="width: 15%; text-align: right;">Trenutna cijena</th>
              </tr>
            </thead>
            <tbody>
              ${redoviTabliceHtml}
            </tbody>
          </table>
          <div class="napomena">Cijene su iskazane u eurima s uključenim porezom.</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

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
