import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Para compatibilidade com Edge runtime, usar WebCrypto + jose em vez de jsonwebtoken
const JWT_SECRET = process.env.JWT_SECRET || 'cantina-secret-key';
// Chave precisa ser passada como Uint8Array para jose
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'cantina_session';

async function validateToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as any;
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const publicPaths = ['/login', '/api/login', '/api/session', '/api/auth-check'];
  const isPublicPath = publicPaths.includes(pathname);
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Log enxuto para depuração
  console.log('[MW]', pathname, token ? 'token:yes' : 'token:no');

  // Página de login: se já autenticado redireciona
  if (pathname === '/login') {
    if (token) {
      const payload = await validateToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        const resp = NextResponse.next();
        resp.cookies.delete(COOKIE_NAME);
        return resp;
      }
    }
    return NextResponse.next();
  }

  // Rotas públicas (APIs auxiliares) liberadas
  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await validateToken(token);
  if (!payload) {
    const resp = NextResponse.redirect(new URL('/login', request.url));
    resp.cookies.delete(COOKIE_NAME);
    return resp;
  }

  const resp = NextResponse.next();
  resp.headers.set('x-user-id', (payload as any).id?.toString() || '');
  resp.headers.set('x-user-tipo', (payload as any).tipo || '');
  return resp;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
