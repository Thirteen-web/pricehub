import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Čitamo sesijski kolačić izravno iz zahtjeva
  const imaSesiju = request.cookies.get('cjenik-session')?.value;
  const putanja = request.nextUrl.pathname;

  // Stroga i egzaktna provjera login stranice (sprječava da se /grupe prepozna kao login)
  const naLoginStranici = putanja === '/login';

  // Pravilo 1: Ako korisnik NIJE prijavljen, a pokušava otvoriti zaštićene stranice
  if (!imaSesiju && !naLoginStranici) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pravilo 2: Ako je korisnik VEĆ prijavljen, a ponovno otvara login, vrati ga na cjenik
  if (imaSesiju && naLoginStranici) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Konfiguracija ruter filtera (određuje koje rute middleware uopće smije nadgledati)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
