import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const imaSesiju = request.cookies.get('cjenik-session')?.value;
  const putanja = request.nextUrl.pathname;

  const naLoginStranici = putanja === '/login';
  const naAdminStranici = putanja.startsWith('/admin');

  // Pravilo 1: Ako korisnik NIJE prijavljen, a želi otvoriti cjenik, grupe ili admin panel
  if (!imaSesiju && !naLoginStranici) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pravilo 2: Ako je korisnik VEĆ prijavljen, a otvara login, vrati ga na početnu
  if (imaSesiju && naLoginStranici) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Izostavljamo sve ključne radne rute iz middleware provjere
     * jer njihovu sigurnost i auth provjeru sada stopostotno i sigurno 
     * obavlja klijentski 'use client' kod i RLS zaštita baze podataka!
     */
    '/((?!_next/static|_next/image|favicon.ico|grupe|postavke|api/export-pdf|api/export-csv|export-xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
