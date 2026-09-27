import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Čitamo naš kolačić izravno iz zahtjeva
  const imaSesiju = request.cookies.get('cjenik-session')?.value;
  const naLoginStranici = request.nextUrl.pathname.startsWith('/login');

  // Pravilo 1: Ako korisnik NIJE prijavljen, a pokušava otvoriti cjenik ili grupe
  if (!imaSesiju && !naLoginStranici) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pravilo 2: Ako je korisnik VEĆ prijavljen, a ponovno otvara login, vrati ga na cjenik
  if (imaSesiju && naLoginStranici) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};