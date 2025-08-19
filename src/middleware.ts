import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'cantina-secret-key';

export function middleware(request: NextRequest) {
  // Rotas que não precisam de autenticação
  const publicPaths = ['/login', '/api/login', '/api/session'];
  const pathname = request.nextUrl.pathname;

  // Se é uma rota pública, permite acesso
  if (publicPaths.includes(pathname)) {
    if (pathname === '/login') {
      const token = request.cookies.get('cantina_session')?.value;
      if (token) {
        try {
          jwt.verify(token, JWT_SECRET);
          const dashboardUrl = new URL('/dashboard', request.url);
          return NextResponse.redirect(dashboardUrl);
        } catch (e) {
          // token inválido, segue fluxo normal
        }
      }
    }
    return NextResponse.next();
  }

  // Verifica se é uma rota protegida (dashboard)
  if (
    pathname.startsWith('/dashboard') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/login'))
  ) {
    const token = request.cookies.get('cantina_session')?.value;

    if (!token) {
      // Redireciona para login se não há token
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verifica se o token é válido
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token inválido, redireciona para login
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('cantina_session');
      return response;
    }
  }

  return NextResponse.next();
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
